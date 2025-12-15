import { motion } from "framer-motion";
import React from "react";
import { FaEllipsisV, FaTrashAlt } from "react-icons/fa";
import { IoCheckmarkDoneOutline } from "react-icons/io5";
import assets from "../../assets/assets";
import { formatMessageTime } from "../../lib/utils";
import ReactionList from "./ReactionList";
import ReactionPicker from "./ReactionPicker";

const MessageItem = ({
  msg,
  isSender,
  selectedUser,
  authUser,
  // users,
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
}) => {
  const isDeleted = msg.deleted;

  return (
    <motion.div
      key={msg._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-end gap-3 ${
        isSender ? "justify-end" : "justify-start"
      } group relative`}
      onTouchStart={
        isSender && !isDeleted ? () => onTouchStart(msg) : undefined
      }
      onTouchEnd={isSender && !isDeleted ? onTouchEnd : undefined}
    >
      {!isSender && (
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0"
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
                  onMessageClick(msg._id);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isDeleted) {
                  onToggleReactionPicker(msg._id);
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
                onClick={() => onToggleDropdown(msg._id)}
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
                  onMessageClick(msg._id);
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (!isDeleted) {
                  onToggleReactionPicker(msg._id);
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
                onClick={() => onToggleDropdown(msg._id)}
              >
                <FaEllipsisV size={12} />
              </button>
            )}
          </div>
        )}

        {/* Reactions */}
        {!isDeleted && msg.reactions && msg.reactions.length > 0 && (
          <ReactionList
            reactions={msg.reactions}
            messageId={msg._id}
            authUser={authUser}
            getUserInfo={getUserInfo}
            groupReactions={groupReactions}
            hoveredReaction={hoveredReaction}
            onHoverReaction={onHoverReaction}
            onReactionClick={onReactionClick}
            onToggleReactionPicker={onToggleReactionPicker}
          />
        )}

        {/* Reaction Picker */}
        {showReactionPicker === msg._id && !isDeleted && (
          <ReactionPicker
            isSender={isSender}
            quickReactions={quickReactions}
            onReactionClick={(emoji) => onReactionClick(msg._id, emoji)}
          />
        )}
      </div>

      {isSender && (
        <img
          src={authUser?.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      )}

      {/* Dropdown Menu */}
      {showDropdown === msg._id && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-8 right-8 bg-white rounded-lg shadow-lg z-10 overflow-hidden border border-gray-200"
        >
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-gray-50"
            onClick={() => onDeleteClick(msg)}
          >
            <FaTrashAlt size={12} />
            Delete
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MessageItem;
