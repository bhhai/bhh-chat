import React from "react";
import { FaInfoCircle } from "react-icons/fa";
import { formatLastActive } from "../../lib/utils";
import assets from "../../assets/assets";

const ChatHeader = ({ selectedUser, onlineUsers, onToggleRightSidebar, showRightSidebar, onBack }) => {
  return (
    <div className="flex items-center gap-3 py-4 px-6 bg-white shadow-sm border-b border-gray-200">
      <img
        src={selectedUser.profilePic || assets.avatar_icon}
        alt=""
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
      />
      <div className="flex-1">
        <p className="flex items-center gap-2 text-gray-900 font-medium">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
          )}
        </p>
        <p className="text-xs text-gray-500">
          {onlineUsers.includes(selectedUser._id)
            ? "Online"
            : selectedUser.lastActive
            ? formatLastActive(selectedUser.lastActive)
            : "Offline"}
        </p>
      </div>
      {/* Mobile & Tablet buttons */}
      <div className="flex items-center gap-2 lg:hidden">
        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title={showRightSidebar ? "Ẩn thông tin" : "Hiện thông tin"}
          >
            <FaInfoCircle className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={onBack}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      <button className="hidden lg:block p-2 text-gray-500 hover:text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default ChatHeader;

