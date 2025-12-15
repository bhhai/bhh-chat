import React from "react";
import MessageItem from "./MessageItem";

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
    <>
      {messages.map((msg, index) => {
        const isSender = msg.sender === authUser._id;
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
    </>
  );
};

export default MessageList;

