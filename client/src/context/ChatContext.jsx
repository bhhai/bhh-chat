import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [messageCache, setMessageCache] = useState({});
  const { socket, axios, authUser } = useContext(AuthContext);

  const getMessages = useCallback(
    async (userId) => {
      try {
        // Immediately show cached messages if available
        if (messageCache[userId]) {
          setMessages(messageCache[userId]);
          // Update unseen messages count
          setUnseenMessages((prev) => ({
            ...prev,
            [userId]: 0,
          }));
          return;
        }

        // If no cache, show empty array and fetch in background
        setMessages([]);
        const { data } = await axios.get(`/api/messages/${userId}`);
        if (data.success) {
          const sortedMessages = data.messages.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setMessages(sortedMessages);
          setMessageCache((prev) => ({
            ...prev,
            [userId]: sortedMessages,
          }));
          setUnseenMessages((prev) => ({
            ...prev,
            [userId]: 0,
          }));
        }
      } catch (error) {
        toast.error(error.message);
      }
    },
    [axios, messageCache]
  );

  // Prefetch messages for all users
  const prefetchMessages = useCallback(
    async (users) => {
      const prefetchPromises = users.map(async (user) => {
        if (!messageCache[user._id]) {
          try {
            const { data } = await axios.get(`/api/messages/${user._id}`);
            if (data.success) {
              const sortedMessages = data.messages.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
              );
              setMessageCache((prev) => ({
                ...prev,
                [user._id]: sortedMessages,
              }));
            }
          } catch (error) {
            console.error(
              `Failed to prefetch messages for user ${user._id}:`,
              error
            );
          }
        }
      });
      await Promise.all(prefetchPromises);
    },
    [axios, messageCache]
  );

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        if (data.unseenMessages) {
          setUnseenMessages(data.unseenMessages);
        }
        // Prefetch messages for all users in the background
        prefetchMessages(data.users);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios, prefetchMessages]);

  const sendMessage = useCallback(
    async (messageData) => {
      try {
        // Create FormData if image file is provided
        const formData = new FormData();
        if (messageData.text) {
          formData.append("text", messageData.text);
        }
        if (messageData.imageFile) {
          formData.append("image", messageData.imageFile);
        }

        // Optimistically update UI
        const optimisticMessage = {
          _id: Date.now().toString(), // Temporary ID
          sender: authUser._id,
          receiver: selectedUser._id,
          text: messageData.text || "",
          image: messageData.imageFile
            ? URL.createObjectURL(messageData.imageFile)
            : "",
          createdAt: new Date().toISOString(),
          seen: false,
          deleted: false,
        };

        setMessages((prevMessages) => [optimisticMessage, ...prevMessages]);
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: [
            optimisticMessage,
            ...(prev[selectedUser._id] || []),
          ],
        }));

        // Send to server with FormData
        const { data } = await axios.post(
          `/api/messages/send/${selectedUser._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        // Clean up object URL
        if (
          optimisticMessage.image &&
          optimisticMessage.image.startsWith("blob:")
        ) {
          URL.revokeObjectURL(optimisticMessage.image);
        }

        // Update with real message data
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === optimisticMessage._id ? data : msg
          )
        );
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: prev[selectedUser._id].map((msg) =>
            msg._id === optimisticMessage._id ? data : msg
          ),
        }));
      } catch (error) {
        // Revert optimistic update on error
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== Date.now().toString())
        );
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: prev[selectedUser._id].filter(
            (msg) => msg._id !== Date.now().toString()
          ),
        }));
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    },
    [axios, selectedUser, authUser]
  );

  const subscribeToMessages = useCallback(() => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.sender === selectedUser._id) {
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
        // Update cache
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: [newMessage, ...(prev[selectedUser._id] || [])],
        }));
        axios.put(`/api/messages/mark/${newMessage._id}`);
        setUnseenMessages((prev) => ({
          ...prev,
          [selectedUser._id]: 0,
        }));
      } else if (
        selectedUser &&
        newMessage.sender === authUser._id &&
        newMessage.receiver === selectedUser._id
      ) {
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
        // Update cache
        setMessageCache((prev) => ({
          ...prev,
          [selectedUser._id]: [newMessage, ...(prev[selectedUser._id] || [])],
        }));
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.sender]: (prevUnseenMessages[newMessage.sender] || 0) + 1,
        }));
      }
    });
    socket.on("messageDeleted", (deletedMsg) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === deletedMsg._id ? deletedMsg : msg))
      );
      setMessageCache((prev) => {
        const updated = { ...prev };
        if (selectedUser && updated[selectedUser._id]) {
          updated[selectedUser._id] = updated[selectedUser._id].map((msg) =>
            msg._id === deletedMsg._id ? deletedMsg : msg
          );
        }
        return updated;
      });
    });
    socket.on("messageReactionUpdated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
      setMessageCache((prev) => {
        const updated = { ...prev };
        if (selectedUser && updated[selectedUser._id]) {
          updated[selectedUser._id] = updated[selectedUser._id].map((msg) =>
            msg._id === updatedMessage._id ? updatedMessage : msg
          );
        }
        return updated;
      });
    });
  }, [socket, selectedUser, authUser, axios]);

  const unsubscribeFromMessages = useCallback(() => {
    if (socket) {
      socket.off("newMessage");
      socket.off("messageDeleted");
      socket.off("messageReactionUpdated");
    }
  }, [socket]);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (!selectedUser) {
      setMessages([]);
    }
  }, [selectedUser]);

  // Update selectedUser when users list is refreshed (to get updated lastActive)
  useEffect(() => {
    if (selectedUser && users.length > 0) {
      const updatedUser = users.find((u) => u._id === selectedUser._id);
      if (updatedUser) {
        setSelectedUser(updatedUser);
      }
    }
  }, [users, selectedUser]);

  // Refresh users every minute to update lastActive
  useEffect(() => {
    if (authUser) {
      const interval = setInterval(() => {
        getUsers();
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [authUser, getUsers]);

  const deleteMessage = useCallback(
    async (messageId) => {
      // Optimistically update message in state and cache
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                text: "This message was deleted",
                deleted: true,
                image: "",
              }
            : msg
        )
      );
      setMessageCache((prev) => {
        const updated = { ...prev };
        if (selectedUser && updated[selectedUser._id]) {
          updated[selectedUser._id] = updated[selectedUser._id].map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  text: "This message was deleted",
                  deleted: true,
                  image: "",
                }
              : msg
          );
        }
        return updated;
      });
      try {
        await axios.delete(`/api/messages/${messageId}`);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete message"
        );
      }
    },
    [axios, selectedUser]
  );

  const toggleReaction = useCallback(
    async (messageId, emoji) => {
      try {
        const { data } = await axios.post(
          `/api/messages/reaction/${messageId}`,
          {
            emoji,
          }
        );
        if (data.success) {
          setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? data.message : msg))
          );
          setMessageCache((prev) => {
            const updated = { ...prev };
            if (selectedUser && updated[selectedUser._id]) {
              updated[selectedUser._id] = updated[selectedUser._id].map((msg) =>
                msg._id === messageId ? data.message : msg
              );
            }
            return updated;
          });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to toggle reaction"
        );
      }
    },
    [axios, selectedUser]
  );

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    deleteMessage,
    toggleReaction,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
