import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios, authUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const getMessageDetail = useCallback(
    async (messageId) => {
      try {
        const { data } = await axios.get(`/api/messages/detail/${messageId}`);
        if (data.success) {
          return data.message;
        }
        return null;
      } catch (error) {
        toast.error(error.message || "Failed to get message detail");
        return null;
      }
    },
    [axios]
  );

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        if (data.unseenMessages) {
          setUnseenMessages(data.unseenMessages);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  }, [axios]);

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

        if (data.success && selectedUser) {
          // Invalidate messages query to refetch and show new message
          queryClient.invalidateQueries({
            queryKey: ["messages", selectedUser._id],
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    },
    [axios, selectedUser, queryClient]
  );

  const subscribeToMessages = useCallback(() => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.sender === selectedUser._id) {
        // Invalidate and refetch messages for current conversation
        queryClient.invalidateQueries({
          queryKey: ["messages", selectedUser._id],
        });
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
        // Invalidate and refetch messages for current conversation
        queryClient.invalidateQueries({
          queryKey: ["messages", selectedUser._id],
        });
      } else {
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [newMessage.sender]: (prevUnseenMessages[newMessage.sender] || 0) + 1,
        }));
      }
    });
    socket.on("messageDeleted", (deletedMsg) => {
      // Invalidate messages query for the conversation
      const conversationUserId =
        deletedMsg.sender === authUser._id
          ? deletedMsg.receiver
          : deletedMsg.sender;
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationUserId],
      });
    });
    socket.on("messageReactionUpdated", (updatedMessage) => {
      // Invalidate messages query for the conversation
      const conversationUserId =
        updatedMessage.sender === authUser._id
          ? updatedMessage.receiver
          : updatedMessage.sender;
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationUserId],
      });
    });
  }, [socket, selectedUser, authUser, axios, queryClient]);

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
      try {
        await axios.delete(`/api/messages/${messageId}`);
        // Invalidate messages query to refetch
        if (selectedUser) {
          queryClient.invalidateQueries({
            queryKey: ["messages", selectedUser._id],
          });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to delete message"
        );
      }
    },
    [axios, selectedUser, queryClient]
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
        if (data.success && selectedUser) {
          // Invalidate messages query to refetch
          queryClient.invalidateQueries({
            queryKey: ["messages", selectedUser._id],
          });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to toggle reaction"
        );
      }
    },
    [axios, selectedUser, queryClient]
  );

  const value = {
    users,
    selectedUser,
    getUsers,
    getMessageDetail,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    deleteMessage,
    toggleReaction,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
