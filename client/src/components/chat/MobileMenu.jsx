import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrashAlt } from "react-icons/fa";

const MobileMenu = ({ show, message, onDelete, onClose }) => {
  if (!show || !message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end bg-black/30 backdrop-blur-sm lg:hidden"
        onClick={onClose}
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
              onDelete(message);
              onClose();
            }}
          >
            <FaTrashAlt size={14} />
            Delete Message
          </button>
          <button
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileMenu;

