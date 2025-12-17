import React from "react";
import { motion } from "framer-motion";
import { FaArrowDown } from "react-icons/fa";

const ScrollToBottomButton = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="absolute bottom-24 right-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg transition-all z-50 cursor-pointer"
    >
      <FaArrowDown size={16} />
    </motion.button>
  );
};

export default ScrollToBottomButton;
