import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { useMessages } from "../hooks/useMessages";
import { useChatBackground } from "../hooks/useChatBackground";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import { useMessageReactions } from "../hooks/useMessageReactions";
import { useMessageActions } from "../hooks/useMessageActions";
import ChatHeader from "./chat/ChatHeader";
import ChatInput from "./chat/ChatInput";
import MessageList from "./chat/MessageList";
import ScrollToBottomButton from "./chat/ScrollToBottomButton";
import MessageDetailModal from "./chat/MessageDetailModal";
import DeleteMessageModal from "./chat/DeleteMessageModal";
import MobileMenu from "./chat/MobileMenu";
import OptimizedImage from "./Image";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const ChatContainer = ({ onToggleRightSidebar, showRightSidebar }) => {
  const {
    selectedUser,
    // setSelectedUser,
    sendMessage,
    users,
    typingUser,
    emitTyping,
    emitStopTyping,
    setUnseenMessages,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  // Custom hooks
  const { chatBackgroundClass, chatBackgroundStyle } =
    useChatBackground(selectedUser);
  const {
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    showScrollButton,
    isLoadingMore,
    reset: resetScroll,
  } = useScrollToBottom(hasNextPage, isFetchingNextPage, fetchNextPage);

  const {
    showReactionPicker,
    setShowReactionPicker,
    hoveredReaction,
    setHoveredReaction,
    quickReactions,
    handleReactionClick,
    groupReactions,
  } = useMessageReactions();

  const {
    showDeleteModal,
    selectedMessageDetail,
    showDropdown,
    showMobileMenu,
    mobileMenuMsg,
    setSelectedMessageDetail,
    setShowDropdown,
    setShowMobileMenu,
    setMobileMenuMsg,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleMessageClick,
  } = useMessageActions();

  // Local state
  const [input, setInput] = useState("");

  // Get user info helper
  const getUserInfo = useCallback(
    (userId) => {
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
    },
    [authUser, selectedUser, users]
  );

  // Touch handlers for mobile
  const longPressTimerRef = React.useRef(null);
  const handleTouchStart = useCallback(
    (msg) => {
      longPressTimerRef.current = setTimeout(() => {
        setMobileMenuMsg(msg);
        setShowMobileMenu(true);
      }, 500);
    },
    [setMobileMenuMsg, setShowMobileMenu]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Message handlers
  const handleSendMessage = useCallback(
    async (text) => {
      await sendMessage({ text });
      scrollToBottom();
    },
    [sendMessage, scrollToBottom]
  );

  const handleSendImage = useCallback(
    async (e) => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith("image/")) {
        toast.error("Select an image file");
        return;
      }
      await sendMessage({ imageFile: file });
      e.target.value = "";
    },
    [sendMessage]
  );

  const handleToggleReactionPicker = useCallback(
    (messageId) => {
      setShowReactionPicker(
        showReactionPicker === messageId ? null : messageId
      );
    },
    [showReactionPicker, setShowReactionPicker]
  );

  const handleToggleDropdown = useCallback(
    (messageId) => {
      setShowDropdown(showDropdown === messageId ? null : messageId);
    },
    [showDropdown, setShowDropdown]
  );

  // Reset scroll, reset unseen count, and refetch messages when user changes
  useEffect(() => {
    if (selectedUser?._id) {
      resetScroll();
      // Reset unseen count for this user immediately
      setUnseenMessages((prev) => ({
        ...prev,
        [selectedUser._id]: 0,
      }));
      // Reset query to page 1 and refetch to ensure mark as seen is called
      // resetQueries will reset to initial state and trigger a refetch
      queryClient
        .resetQueries({
          queryKey: ["messages", selectedUser._id],
          exact: true,
        })
        .then(() => {
          // Ensure refetch happens after reset
          queryClient.refetchQueries({
            queryKey: ["messages", selectedUser._id],
            exact: true,
          });
        });
    }
  }, [selectedUser?._id, resetScroll, setUnseenMessages, queryClient]);

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
  }, [showReactionPicker, setShowReactionPicker]);

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
      <ChatHeader
        selectedUser={selectedUser}
        onlineUsers={onlineUsers}
        onToggleRightSidebar={onToggleRightSidebar}
        showRightSidebar={showRightSidebar}
        onBack={() => {
          navigate(-1);
        }}
        typingUser={typingUser}
      />

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse relative"
      >
        <MessageList
          messages={messages}
          selectedUser={selectedUser}
          authUser={authUser}
          users={users}
          showReactionPicker={showReactionPicker}
          showDropdown={showDropdown}
          hoveredReaction={hoveredReaction}
          onMessageClick={handleMessageClick}
          onReactionClick={handleReactionClick}
          onDeleteClick={handleDeleteClick}
          onToggleReactionPicker={handleToggleReactionPicker}
          onToggleDropdown={handleToggleDropdown}
          onHoverReaction={setHoveredReaction}
          groupReactions={groupReactions}
          getUserInfo={getUserInfo}
          quickReactions={quickReactions}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          isLoadingMore={isLoadingMore}
          isFetchingNextPage={isFetchingNextPage}
        />

        <ScrollToBottomButton
          show={showScrollButton}
          onClick={scrollToBottom}
        />
      </div>

      {/* Input Box */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        onSendImage={handleSendImage}
        onTyping={() => emitTyping(selectedUser?._id)}
        onStopTyping={() => emitStopTyping(selectedUser?._id)}
      />

      {/* Modals */}
      <DeleteMessageModal
        show={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <MobileMenu
        show={showMobileMenu}
        message={mobileMenuMsg}
        onDelete={handleDeleteClick}
        onClose={() => setShowMobileMenu(false)}
      />

      <MessageDetailModal
        message={selectedMessageDetail}
        onClose={() => setSelectedMessageDetail(null)}
        groupReactions={groupReactions}
      />
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
        <OptimizedImage
          src={assets.logo_icon}
          alt="BHH Chat logo"
          width={80}
          height={80}
          className="w-20 h-20 mb-4"
          objectFit="contain"
          priority
        />
        <h3 className="text-2xl font-medium text-gray-800">BHH Chat</h3>
        <p className="text-gray-500 mt-2">Select a chat to start messaging</p>
      </motion.div>
    </div>
  );
};

export default ChatContainer;
