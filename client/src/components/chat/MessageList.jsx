import React from "react";
import MessageItem from "./MessageItem";
import { isSameSender } from "../../lib/utils";

const MessageList = ({
  messages,
  selectedUser,
  authUser,
  users,
  showReactionPicker,
  showDropdown,
  hoveredReaction,
  onMessageClick,
  onReactionClick,
  onDeleteClick,
  onToggleReactionPicker,
  onToggleDropdown,
  onHoverReaction,
  groupReactions,
  getUserInfo,
  quickReactions,
  onTouchStart,
  onTouchEnd,
  isLoadingMore,
  isFetchingNextPage,
}) => {
  return (
    <div className="pb-2 space-y-2">
      {messages.map((msg, index) => {
        // Handle both populated (object) and non-populated (string) sender
        const senderId =
          typeof msg.sender === "object" && msg.sender !== null
            ? msg.sender._id || msg.sender
            : msg.sender;
        const isSender = senderId?.toString() === authUser._id?.toString();

        // Get next message (in chronological order, which is next in array since messages are reversed)
        // If next message has same sender, hide avatar (avatar will show on the last message in group)
        const nextMsg =
          index < messages.length - 1 ? messages[index + 1] : null;
        const shouldShowAvatar = !isSameSender(msg, nextMsg);

        return (
          <MessageItem
            key={msg._id || index}
            msg={msg}
            isSender={isSender}
            selectedUser={selectedUser}
            authUser={authUser}
            users={users}
            showReactionPicker={showReactionPicker}
            showDropdown={showDropdown}
            hoveredReaction={hoveredReaction}
            onMessageClick={onMessageClick}
            onReactionClick={onReactionClick}
            onDeleteClick={onDeleteClick}
            onToggleReactionPicker={onToggleReactionPicker}
            onToggleDropdown={onToggleDropdown}
            onHoverReaction={onHoverReaction}
            groupReactions={groupReactions}
            getUserInfo={getUserInfo}
            quickReactions={quickReactions}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            shouldShowAvatar={shouldShowAvatar}
          />
        );
      })}

      {/* Loading More Indicator */}
      {(isLoadingMore || isFetchingNextPage) && (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">
            Loading older messages...
          </p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
