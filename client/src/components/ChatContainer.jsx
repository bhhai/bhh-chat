import React, {
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { formatMessageTime, formatLastActive } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { useMessages } from "../hooks/useMessages";
import {
  FaTrashAlt,
  FaEllipsisV,
  FaArrowDown,
  FaPaperclip,
  FaInfoCircle,
} from "react-icons/fa";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";

const ChatContainer = ({ onToggleRightSidebar, showRightSidebar }) => {
  const {
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessageDetail,
    deleteMessage,
    toggleReaction,
    users,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  // Use TanStack Query for messages
  const {
    data: messagesData,
    isLoading: isLoadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(selectedUser?._id);

  // Flatten messages from all pages
  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return messagesData.pages.flatMap((page) => page.messages);
  }, [messagesData]);

  // Background options mapping
  const getBackgroundClass = (backgroundId) => {
    const backgrounds = {
      "gradient-indigo-blue": "bg-gradient-to-br from-indigo-50 to-blue-50",
      "gradient-purple-pink": "bg-gradient-to-br from-purple-50 to-pink-50",
      "gradient-green-blue": "bg-gradient-to-br from-green-50 to-blue-50",
      "gradient-orange-red": "bg-gradient-to-br from-orange-50 to-red-50",
      "gradient-yellow-orange": "bg-gradient-to-br from-yellow-50 to-orange-50",
      "solid-white": "bg-white",
      "solid-gray": "bg-gray-50",
      "solid-blue": "bg-blue-50",
    };
    return (
      backgrounds[backgroundId] || "bg-gradient-to-br from-indigo-50 to-blue-50"
    );
  };

  // Get theme for current conversation
  const getConversationTheme = () => {
    if (!selectedUser || !authUser?.chatThemes) {
      return "gradient-indigo-blue"; // Default
    }
    // Convert Map to object if needed, or access directly
    const themes = authUser.chatThemes;
    if (themes instanceof Map) {
      return themes.get(selectedUser._id) || "gradient-indigo-blue";
    } else if (typeof themes === "object" && themes !== null) {
      return themes[selectedUser._id] || "gradient-indigo-blue";
    }
    return "gradient-indigo-blue";
  };

  const chatBackground = getConversationTheme();
  const isImageBackground = chatBackground?.startsWith("http");
  const chatBackgroundClass = isImageBackground
    ? ""
    : getBackgroundClass(chatBackground);
  const chatBackgroundStyle = isImageBackground
    ? {
        backgroundImage: `url(${chatBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    : {};

  const messagesContainerRef = useRef();
  const hasTriggeredLoadMore = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [input, setInput] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuMsg, setMobileMenuMsg] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [hoveredReaction, setHoveredReaction] = useState(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState(null);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container; // With flex-col-reverse, bottom is scrollTop = 0
    const SCROLL_THRESHOLD = -100;
    setShowScrollButton(scrollTop < SCROLL_THRESHOLD);

    if (!hasNextPage || isFetchingNextPage || isLoadingMore) {
      return;
    }

    const point = clientHeight - scrollHeight;
    const isAtTop = point === scrollTop;

    if (isAtTop && !hasTriggeredLoadMore.current) {
      hasTriggeredLoadMore.current = true;
      setIsLoadingMore(true);
      fetchNextPage()
        .then(() => {
          // Reset flag after fetch completes to allow loading next page
          setTimeout(() => {
            hasTriggeredLoadMore.current = false;
            setIsLoadingMore(false);
          }, 300);
        })
        .catch(() => {
          // Reset flag on error too
          hasTriggeredLoadMore.current = false;
          setIsLoadingMore(false);
        });
    } else if (!isAtTop) {
      // Reset flag when user scrolls away from top (allows retry)
      hasTriggeredLoadMore.current = false;
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isFetchingNextPage, isLoadingMore, fetchNextPage]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
    scrollToBottom();
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select an image file");
      return;
    }

    // Send file directly instead of converting to base64
    await sendMessage({ imageFile: file });
    e.target.value = "";
  };

  const handleDeleteClick = (msg) => {
    setMessageToDelete(msg);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete._id);
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  };

  // Group reactions by emoji
  const groupReactions = (reactions) => {
    if (!reactions || reactions.length === 0) return [];
    const grouped = {};
    reactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = [];
      }
      grouped[reaction.emoji].push(reaction);
    });
    return Object.entries(grouped).map(([emoji, users]) => ({
      emoji,
      users,
      count: users.length,
    }));
  };

  // Get user info from userId
  const getUserInfo = (userId) => {
    if (String(userId) === String(authUser._id)) {
      return {
        fullName: authUser.fullName,
        profilePic: authUser.profilePic,
      };
    }
    if (String(userId) === String(selectedUser?._id)) {
      return {
        fullName: selectedUser.fullName,
        profilePic: selectedUser.profilePic,
      };
    }
    const user = users.find((u) => String(u._id) === String(userId));
    return user
      ? { fullName: user.fullName, profilePic: user.profilePic }
      : { fullName: "Unknown", profilePic: null };
  };

  // Quick reaction emojis
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleReactionClick = async (messageId, emoji) => {
    await toggleReaction(messageId, emoji);
    setShowReactionPicker(null);
  };

  const handleMessageClick = async (messageId) => {
    const detail = await getMessageDetail(messageId);
    if (detail) {
      setSelectedMessageDetail(detail);
    }
  };

  let longPressTimer = null;
  const handleTouchStart = (msg) => {
    longPressTimer = setTimeout(() => {
      setMobileMenuMsg(msg);
      setShowMobileMenu(true);
    }, 500);
  };
  const handleTouchEnd = () => {
    clearTimeout(longPressTimer);
  };

  // Reset trigger flag and loading state when user changes
  useEffect(() => {
    hasTriggeredLoadMore.current = false;
    setIsLoadingMore(false);
    setShowScrollButton(false);
  }, [selectedUser?._id]);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showReactionPicker &&
        !e.target.closest(".reaction-picker-container") &&
        !e.target.closest(".reaction-area")
      ) {
        setShowReactionPicker(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showReactionPicker]);

  if (isLoadingMessages && messages.length === 0) {
    return (
      <div
        className={`h-full flex items-center justify-center ${chatBackgroundClass}`}
        style={chatBackgroundStyle}
      >
        <div className="animate-pulse text-gray-600">Loading messages...</div>
      </div>
    );
  }

  return selectedUser ? (
    <div
      className={`h-full flex flex-col ${chatBackgroundClass}`}
      style={chatBackgroundStyle}
    >
      {/* Header */}
      <div className="flex items-center gap-3 py-4 px-6 bg-white shadow-sm border-b border-gray-200">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
        />
        <div className="flex-1">
          <p className="flex items-center gap-2 text-gray-900 font-medium">
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {onlineUsers.includes(selectedUser._id)
              ? "Online"
              : selectedUser.lastActive
              ? formatLastActive(selectedUser.lastActive)
              : "Offline"}
          </p>
        </div>
        {/* Mobile & Tablet buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          {onToggleRightSidebar && (
            <button
              onClick={onToggleRightSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              title={showRightSidebar ? "Ẩn thông tin" : "Hiện thông tin"}
            >
              <FaInfoCircle className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setSelectedUser(null)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <button className="hidden lg:block p-2 text-gray-500 hover:text-gray-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse relative"
      >
        {messages.map((msg, index) => {
          const isSender = msg.sender === authUser._id;
          const isDeleted = msg.deleted;
          return (
            <motion.div
              key={msg._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-end gap-3 ${
                isSender ? "justify-end" : "justify-start"
              } group relative`}
              onTouchStart={
                isSender && !isDeleted ? () => handleTouchStart(msg) : undefined
              }
              onTouchEnd={isSender && !isDeleted ? handleTouchEnd : undefined}
            >
              {!isSender && (
                <img
                  src={selectedUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}

              <div className="flex flex-col items-end max-w-[80%]">
                {isDeleted ? (
                  <div className="italic text-sm text-gray-500 bg-gray-100 rounded-lg px-4 py-2">
                    This message was deleted
                  </div>
                ) : msg.image ? (
                  <div className="relative group">
                    <div
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDeleted) {
                          handleMessageClick(msg._id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (!isDeleted) {
                          setShowReactionPicker(
                            showReactionPicker === msg._id ? null : msg._id
                          );
                        }
                      }}
                    >
                      <img
                        src={msg.image}
                        alt=""
                        className="max-w-[280px] rounded-lg shadow-sm border border-gray-200"
                      />
                    </div>
                    {isSender && (
                      <button
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          setShowDropdown(
                            msg._id === showDropdown ? null : msg._id
                          )
                        }
                      >
                        <FaEllipsisV size={12} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative group">
                    <div
                      className={`px-4 py-3 rounded-2xl cursor-pointer ${
                        isSender
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDeleted) {
                          handleMessageClick(msg._id);
                        }
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        if (!isDeleted) {
                          setShowReactionPicker(
                            showReactionPicker === msg._id ? null : msg._id
                          );
                        }
                      }}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                        {isSender && msg.seen ? (
                          <IoCheckmarkDoneOutline className="text-green-500" />
                        ) : null}
                      </div>
                    </div>
                    {isSender && (
                      <button
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-500 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() =>
                          setShowDropdown(
                            msg._id === showDropdown ? null : msg._id
                          )
                        }
                      >
                        <FaEllipsisV size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Reactions */}
                {!isDeleted && msg.reactions && msg.reactions.length > 0 && (
                  <div
                    className="reaction-area mt-1 flex flex-wrap gap-1 relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Click vào reaction area (không phải button) để mở picker
                      if (!e.target.closest("button")) {
                        setShowReactionPicker(
                          showReactionPicker === msg._id ? null : msg._id
                        );
                      }
                    }}
                  >
                    {groupReactions(msg.reactions).map((reactionGroup, idx) => {
                      const hasUserReaction = reactionGroup.users.some(
                        (r) => String(r.userId) === String(authUser._id)
                      );
                      const reactionKey = `${msg._id}-${reactionGroup.emoji}`;
                      const isHovered = hoveredReaction === reactionKey;

                      return (
                        <div
                          key={idx}
                          className="relative"
                          onMouseEnter={() => setHoveredReaction(reactionKey)}
                          onMouseLeave={() => setHoveredReaction(null)}
                        >
                          <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReactionClick(msg._id, reactionGroup.emoji);
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                              hasUserReaction
                                ? "bg-indigo-100 border border-indigo-300"
                                : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            <span className="text-sm">
                              {reactionGroup.emoji}
                            </span>
                            <span
                              className={`text-xs ${
                                hasUserReaction
                                  ? "text-indigo-700 font-medium"
                                  : "text-gray-600"
                              }`}
                            >
                              {reactionGroup.count}
                            </span>
                          </motion.button>

                          {/* Reaction Tooltip */}
                          {isHovered && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 5 }}
                              className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-30 min-w-[200px] max-w-[250px]"
                            >
                              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                                <span className="text-lg">
                                  {reactionGroup.emoji}
                                </span>
                                <span className="text-xs font-medium text-gray-700">
                                  {reactionGroup.count}{" "}
                                  {reactionGroup.count === 1
                                    ? "reaction"
                                    : "reactions"}
                                </span>
                              </div>
                              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                                {reactionGroup.users.map((reaction, rIdx) => {
                                  const userInfo = getUserInfo(reaction.userId);
                                  const isCurrentUser =
                                    String(reaction.userId) ===
                                    String(authUser._id);
                                  return (
                                    <div
                                      key={rIdx}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <img
                                        src={
                                          userInfo.profilePic ||
                                          assets.avatar_icon
                                        }
                                        alt={userInfo.fullName}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                      <span
                                        className={`flex-1 ${
                                          isCurrentUser
                                            ? "text-indigo-600 font-medium"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {isCurrentUser
                                          ? "You"
                                          : userInfo.fullName}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Reaction Picker */}
                {showReactionPicker === msg._id && !isDeleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className={`reaction-picker-container absolute bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 z-50 ${
                      isSender ? "right-0" : "left-0"
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {quickReactions.map((emoji) => (
                      <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleReactionClick(msg._id, emoji)}
                        className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>

              {isSender && (
                <img
                  src={authUser?.profilePic || assets.avatar_icon}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}

              {showDropdown === msg._id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-8 right-8 bg-white rounded-lg shadow-lg z-10 overflow-hidden border border-gray-200"
                >
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
                    onClick={() => handleDeleteClick(msg)}
                  >
                    <FaTrashAlt size={12} />
                    Delete
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {/* Loading More Indicator - shown at top when loading older messages */}
        {(isLoadingMore || isFetchingNextPage) && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
            <p className="mt-2 text-sm text-gray-500">
              Loading older messages...
            </p>
          </div>
        )}

        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all"
          >
            <FaArrowDown size={16} />
          </motion.button>
        )}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <label className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer transition-colors">
            <FaPaperclip size={18} />
            <input
              onChange={handleSendImage}
              type="file"
              id="image"
              accept="image/png, image/jpeg"
              className="hidden"
            />
          </label>
          <div className="flex-1">
            <input
              onChange={(e) => setInput(e.target.value)}
              value={input}
              type="text"
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 border-none rounded-full text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim()}
            className={`p-3 rounded-full ${
              input.trim()
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "bg-gray-300 cursor-not-allowed"
            } text-white transition-colors`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </form>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delete message?
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && mobileMenuMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="w-full bg-white rounded-t-2xl p-4 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  handleDeleteClick(mobileMenuMsg);
                  setShowMobileMenu(false);
                }}
              >
                <FaTrashAlt size={14} />
                Delete Message
              </button>
              <button
                className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessageDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSelectedMessageDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Message Details
                </h3>
                <button
                  onClick={() => setSelectedMessageDetail(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {selectedMessageDetail.image && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <img
                      src={selectedMessageDetail.image}
                      alt="Message"
                      className="mt-2 rounded-lg max-w-full"
                    />
                  </div>
                )}
                {selectedMessageDetail.text && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <p className="mt-2 text-gray-800">
                      {selectedMessageDetail.text}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sent At
                  </label>
                  <p className="mt-2 text-gray-600">
                    {new Date(selectedMessageDetail.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedMessageDetail.reactions &&
                  selectedMessageDetail.reactions.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Reactions
                      </label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {groupReactions(selectedMessageDetail.reactions).map(
                          (reaction) => (
                            <div
                              key={reaction.emoji}
                              className="flex items-center gap-1 bg-gray-100 rounded-full px-3 py-1"
                            >
                              <span>{reaction.emoji}</span>
                              <span className="text-sm text-gray-600">
                                {reaction.count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  ) : (
    <div
      className={`hidden lg:flex flex-col items-center justify-center gap-4 h-full ${chatBackgroundClass}`}
      style={chatBackgroundStyle}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col items-center"
      >
        <img src={assets.logo_icon} alt="" className="w-20 h-20 mb-4" />
        <h3 className="text-2xl font-medium text-gray-800">BHH Chat</h3>
        <p className="text-gray-500 mt-2">Select a chat to start messaging</p>
      </motion.div>
    </div>
  );
};

export default ChatContainer;
