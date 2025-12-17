import React, { useEffect, useRef, useState } from "react";
import { FaPaperclip } from "react-icons/fa";

const ChatInput = ({
  input,
  setInput,
  onSendMessage,
  onSendImage,
  onTyping,
  onStopTyping,
}) => {
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef(null);
  const hasEmittedTypingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear existing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (typingDebounceRef.current) {
      clearTimeout(typingDebounceRef.current);
    }

    if (input.trim() !== "") {
      // Debounce typing event - only emit after 300ms of typing
      if (!hasEmittedTypingRef.current) {
        typingDebounceRef.current = setTimeout(() => {
          onTyping?.();
          hasEmittedTypingRef.current = true;
        }, 300);
      }

      // Reset stop typing timeout each time user types
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping?.();
        hasEmittedTypingRef.current = false;
      }, 2000);
    } else {
      // Stop typing if input is empty
      if (hasEmittedTypingRef.current) {
        onStopTyping?.();
        hasEmittedTypingRef.current = false;
      }
    }

    // Cleanup on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (typingDebounceRef.current) {
        clearTimeout(typingDebounceRef.current);
      }
    };
  }, [input, onTyping, onStopTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "" || isLoading) return;
    onStopTyping?.();
    setIsLoading(true);
    try {
      await onSendMessage(input.trim());
      setInput("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <label className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer transition-colors">
          <FaPaperclip size={18} />
          <input
            onChange={onSendImage}
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
          disabled={!input.trim() || isLoading}
          className={`p-3 rounded-full ${
            input.trim() && !isLoading
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-300 cursor-not-allowed"
          } text-white transition-colors flex items-center justify-center`}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
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
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
