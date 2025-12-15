import React from "react";
import { FaPaperclip } from "react-icons/fa";

const ChatInput = ({ input, setInput, onSendMessage, onSendImage }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSendMessage(input.trim());
    setInput("");
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
  );
};

export default ChatInput;

