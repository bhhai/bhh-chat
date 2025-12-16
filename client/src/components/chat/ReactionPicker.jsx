import React from "react";
import { motion } from "framer-motion";

const ReactionPicker = ({ isSender, quickReactions, onReactionClick }) => {
  return (
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
          onClick={() => onReactionClick(emoji)}
          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 rounded transition-colors"
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
};

export default ReactionPicker;
