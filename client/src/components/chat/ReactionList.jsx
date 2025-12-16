import React from "react";
import { motion } from "framer-motion";
import assets from "../../assets/assets";
import OptimizedImage from "../Image";

const ReactionList = ({
  reactions,
  messageId,
  authUser,
  getUserInfo,
  groupReactions,
  hoveredReaction,
  onHoverReaction,
  onReactionClick,
  onToggleReactionPicker,
}) => {
  const groupedReactions = groupReactions(reactions);

  return (
    <div
      className="reaction-area mt-1 flex flex-wrap gap-1 relative"
      onClick={(e) => {
        e.stopPropagation();
        if (!e.target.closest("button")) {
          onToggleReactionPicker(messageId);
        }
      }}
    >
      {groupedReactions.map((reactionGroup, idx) => {
        const hasUserReaction = reactionGroup.users.some(
          (r) => String(r.userId) === String(authUser._id)
        );
        const reactionKey = `${messageId}-${reactionGroup.emoji}`;
        const isHovered = hoveredReaction === reactionKey;

        return (
          <div
            key={idx}
            className="relative"
            onMouseEnter={() => onHoverReaction(reactionKey)}
            onMouseLeave={() => onHoverReaction(null)}
          >
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onReactionClick(messageId, reactionGroup.emoji);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all ${
                hasUserReaction
                  ? "bg-indigo-100 border border-indigo-300"
                  : "bg-gray-100 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              <span className="text-sm">{reactionGroup.emoji}</span>
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
                  <span className="text-lg">{reactionGroup.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">
                    {reactionGroup.count}{" "}
                    {reactionGroup.count === 1 ? "reaction" : "reactions"}
                  </span>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {reactionGroup.users.map((reaction, rIdx) => {
                    const userInfo = getUserInfo(reaction.userId);
                    const isCurrentUser =
                      String(reaction.userId) === String(authUser._id);
                    return (
                      <div
                        key={rIdx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <OptimizedImage
                          src={userInfo.profilePic || assets.avatar_icon}
                          alt={userInfo.fullName}
                          width={24}
                          height={24}
                          className="w-6 h-6 rounded-full"
                          objectFit="cover"
                          priority
                        />
                        <span
                          className={`flex-1 ${
                            isCurrentUser
                              ? "text-indigo-600 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {isCurrentUser ? "You" : userInfo.fullName}
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
  );
};

export default ReactionList;

