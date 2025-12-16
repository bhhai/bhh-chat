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
  const [typingUser, setTypingUser] = useState(null);
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
        // Create pending message to show immediately with low opacity
        const tempId = `pending-${Date.now()}-${Math.random()}`;
        const pendingMessage = {
          _id: tempId,
          text: messageData.text || "",
          image: messageData.imageFile ? URL.createObjectURL(messageData.imageFile) : null,
          sender: authUser._id,
          receiver: selectedUser._id,
          createdAt: new Date().toISOString(),
          seen: false,
          isPending: true,
          tempId: tempId,
        };

        // Add pending message to cache immediately
        if (selectedUser) {
          queryClient.setQueryData(["messages", selectedUser._id], (oldData) => {
            if (!oldData || !oldData.pages || oldData.pages.length === 0) {
              return {
                pages: [
                  {
                    messages: [pendingMessage],
                    hasMore: true,
                    page: 1,
                    total: 1,
                  },
                ],
                pageParams: [1],
              };
            }

            const firstPage = oldData.pages[0];
            const updatedFirstPage = {
              ...firstPage,
              messages: [pendingMessage, ...firstPage.messages],
            };

            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          });
        }

        // Create FormData if image file is provided
        const formData = new FormData();
        if (messageData.text) {
          formData.append("text", messageData.text);
        }
        if (messageData.imageFile) {
          formData.append("image", messageData.imageFile);
        }

        // Send to server with FormData
        await axios.post(`/api/messages/send/${selectedUser._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Don't reset queries here - let socket event handle the update
        // The socket event will replace the pending message with the confirmed message
      } catch (error) {
        // Remove pending message on error
        if (selectedUser) {
          queryClient.setQueryData(["messages", selectedUser._id], (oldData) => {
            if (!oldData || !oldData.pages || oldData.pages.length === 0) {
              return oldData;
            }

            const firstPage = oldData.pages[0];
            const updatedMessages = firstPage.messages.filter(
              (msg) => msg.tempId !== tempId
            );

            if (updatedMessages.length === firstPage.messages.length) {
              return oldData;
            }

            const updatedFirstPage = {
              ...firstPage,
              messages: updatedMessages,
            };

            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          });
        }
        toast.error(error.response?.data?.message || "Failed to send message");
      }
    },
    [axios, selectedUser, authUser, queryClient]
  );

  const subscribeToMessages = useCallback(() => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      // Handle both populated (object) and non-populated (string) sender/receiver
      const senderId =
        typeof newMessage.sender === "object" && newMessage.sender !== null
          ? newMessage.sender._id || newMessage.sender
          : newMessage.sender;
      const receiverId =
        typeof newMessage.receiver === "object" && newMessage.receiver !== null
          ? newMessage.receiver._id || newMessage.receiver
          : newMessage.receiver;

      const conversationUserId =
        senderId?.toString() === authUser._id?.toString()
          ? receiverId
          : senderId;

      // Update cache optimistically by adding message to first page
      if (
        selectedUser &&
        conversationUserId?.toString() === selectedUser._id?.toString()
      ) {
        queryClient.setQueryData(["messages", selectedUser._id], (oldData) => {
          // If no cache exists yet, create a new page with the message
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return {
              pages: [
                {
                  messages: [newMessage],
                  hasMore: true,
                  page: 1,
                  total: 1,
                },
              ],
              pageParams: [1],
            };
          }

          const firstPage = oldData.pages[0];
          
          // Check if message already exists in cache (by _id)
          const messageExists = firstPage.messages.some(
            (msg) => msg._id?.toString() === newMessage._id?.toString()
          );

          if (messageExists) {
            return oldData;
          }

          // If this is a message sent by current user, try to replace pending message
          if (senderId?.toString() === authUser._id?.toString()) {
            // Find the first pending message from current user (most recent pending)
            const pendingIndex = firstPage.messages.findIndex(
              (msg) => {
                const msgSenderId =
                  typeof msg.sender === "object" && msg.sender !== null
                    ? msg.sender._id || msg.sender
                    : msg.sender;
                return (
                  msg.isPending &&
                  msgSenderId?.toString() === authUser._id?.toString()
                );
              }
            );

            if (pendingIndex !== -1) {
              // Replace pending message with confirmed message
              // Keep tempId for smooth layoutId transition
              const updatedMessages = [...firstPage.messages];
              const pendingMsg = updatedMessages[pendingIndex];
              updatedMessages[pendingIndex] = {
                ...newMessage,
                tempId: pendingMsg.tempId || pendingMsg._id, // Preserve tempId for layoutId
              };
              const updatedFirstPage = {
                ...firstPage,
                messages: updatedMessages,
              };

              return {
                ...oldData,
                pages: [updatedFirstPage, ...oldData.pages.slice(1)],
              };
            }
          }

          // Add new message to the first page (newest messages)
          const updatedFirstPage = {
            ...firstPage,
            messages: [newMessage, ...firstPage.messages],
          };

          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)],
          };
        });

        // Mark as seen if it's a message from the other user
        if (senderId?.toString() === selectedUser._id?.toString()) {
          axios.put(`/api/messages/mark/${newMessage._id}`);
          setUnseenMessages((prev) => ({
            ...prev,
            [selectedUser._id]: 0,
          }));
        }
      } else {
        console.log("Not current conversation, updating unseen count");
        // Update unseen messages count for other conversations
        setUnseenMessages((prevUnseenMessages) => ({
          ...prevUnseenMessages,
          [conversationUserId]:
            (prevUnseenMessages[conversationUserId] || 0) + 1,
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
    socket.on("messageSeen", (seenMessage) => {
      // Update seen status in cache for messages sent by current user
      const senderId =
        typeof seenMessage.sender === "object" && seenMessage.sender !== null
          ? seenMessage.sender._id || seenMessage.sender
          : seenMessage.sender;
      const receiverId =
        typeof seenMessage.receiver === "object" &&
        seenMessage.receiver !== null
          ? seenMessage.receiver._id || seenMessage.receiver
          : seenMessage.receiver;

      // If the seen message was sent by current user to selectedUser, update cache
      if (
        selectedUser &&
        senderId?.toString() === authUser._id?.toString() &&
        receiverId?.toString() === selectedUser._id?.toString()
      ) {
        queryClient.setQueryData(["messages", selectedUser._id], (oldData) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return oldData;
          }

          // Update seen status for the message
          const updatedPages = oldData.pages.map((page) => ({
            ...page,
            messages: page.messages.map((msg) =>
              msg._id?.toString() === seenMessage._id?.toString()
                ? { ...msg, seen: true }
                : msg
            ),
          }));

          return {
            ...oldData,
            pages: updatedPages,
          };
        });
      }
    });
    socket.on("typing", (data) => {
      // Handle typing indicator
      const typingUserId =
        typeof data.userId === "object" && data.userId !== null
          ? data.userId._id || data.userId
          : data.userId;

      if (
        selectedUser &&
        typingUserId?.toString() === selectedUser._id?.toString()
      ) {
        setTypingUser(typingUserId);
      }
    });
    socket.on("stopTyping", (data) => {
      // Handle stop typing
      const typingUserId =
        typeof data.userId === "object" && data.userId !== null
          ? data.userId._id || data.userId
          : data.userId;

      if (
        selectedUser &&
        typingUserId?.toString() === selectedUser._id?.toString()
      ) {
        setTypingUser(null);
      }
    });
    socket.on("chatThemeUpdated", async (data) => {
      // Handle chat theme sync - refresh authUser to get updated chatThemes
      if (selectedUser && data.conversationUserId === selectedUser._id) {
        // Refetch user data to get updated chatThemes
        try {
          const { data: userData } = await axios.get("/api/auth/check");
          if (userData.success) {
            // Update authUser in AuthContext
            // This will be handled by AuthContext's checkAuth
          }
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      }
    });
  }, [socket, selectedUser, authUser, axios, queryClient]);

  const unsubscribeFromMessages = useCallback(() => {
    if (socket) {
      socket.off("newMessage");
      socket.off("messageDeleted");
      socket.off("messageReactionUpdated");
      socket.off("messageSeen");
      socket.off("typing");
      socket.off("stopTyping");
    }
  }, [socket]);

  // Function to emit typing event
  const emitTyping = useCallback(
    (receiverId) => {
      if (socket && receiverId) {
        socket.emit("typing", { userId: authUser._id, receiverId });
      }
    },
    [socket, authUser]
  );

  // Function to emit stop typing event
  const emitStopTyping = useCallback(
    (receiverId) => {
      if (socket && receiverId) {
        socket.emit("stopTyping", { userId: authUser._id, receiverId });
      }
    },
    [socket, authUser]
  );

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [subscribeToMessages, unsubscribeFromMessages]);

  // Reset typingUser when selectedUser changes
  useEffect(() => {
    setTypingUser(null);
  }, [selectedUser?._id]);

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
    typingUser,
    emitTyping,
    emitStopTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
