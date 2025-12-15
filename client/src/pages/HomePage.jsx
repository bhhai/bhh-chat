import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../context/ChatContext";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { FaInfoCircle, FaTimes, FaArrowLeft } from "react-icons/fa";

const HomePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { selectedUser, setSelectedUser, users } = useContext(ChatContext);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  // Set selectedUser based on URL params
  useEffect(() => {
    if (userId) {
      const user = users.find((u) => u._id === userId);
      if (user && selectedUser?._id !== userId) {
        setSelectedUser(user);
      } else if (!user && users.length > 0) {
        // User not found, redirect to home
        navigate("/");
      }
    } else {
      // No userId in URL, clear selectedUser
      if (selectedUser) {
        setSelectedUser(null);
      }
    }
  }, [userId, users, selectedUser, setSelectedUser, navigate]);

  // Reset right sidebar when selectedUser changes
  useEffect(() => {
    setShowRightSidebar(false);
  }, [selectedUser]);

  const toggleRightSidebar = () => {
    setShowRightSidebar((prev) => !prev);
  };

  return (
    <div className="w-full h-screen bg-gray-50 p-0 lg:p-4 xl:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={`w-full h-full bg-white rounded-none lg:rounded-xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-[350px_1fr] relative
          ${
            selectedUser
              ? "fixed inset-0 lg:static lg:rounded-xl lg:h-full"
              : "h-full"
          }
          ${
            selectedUser && showRightSidebar
              ? "lg:grid-cols-[350px_1fr_350px] xl:grid-cols-[400px_1fr_400px]"
              : selectedUser
              ? "lg:grid-cols-[400px_1fr]"
              : ""
          }`}
      >
        {/* Left Sidebar */}
        <AnimatePresence>
          {(!selectedUser || window.innerWidth >= 1024) && (
            <motion.div
              key="sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`h-full overflow-y-auto border-r border-gray-100 ${
                selectedUser ? "hidden lg:block" : "block"
              }`}
            >
              <Sidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Container */}
        <div className="h-full overflow-hidden relative">
          {/* Toggle Right Sidebar Button - Desktop */}
          {selectedUser && (
            <button
              onClick={toggleRightSidebar}
              className={`hidden lg:flex absolute top-4 right-4 z-20 p-2.5 rounded-full shadow-md transition-all duration-200 ${
                showRightSidebar
                  ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              title={showRightSidebar ? "Ẩn thông tin" : "Hiện thông tin"}
            >
              {showRightSidebar ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaInfoCircle className="w-5 h-5" />
              )}
            </button>
          )}
          <ChatContainer
            onToggleRightSidebar={toggleRightSidebar}
            showRightSidebar={showRightSidebar}
          />
        </div>

        {/* Right Sidebar - Desktop */}
        <AnimatePresence>
          {selectedUser && showRightSidebar && (
            <motion.div
              key="right-sidebar-desktop"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ willChange: "transform" }}
              className="hidden lg:block h-full overflow-y-auto border-l border-gray-100"
            >
              <RightSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Sidebar - Mobile & Tablet (Fullscreen Overlay) */}
        <AnimatePresence>
          {selectedUser && showRightSidebar && (
            <motion.div
              key="right-sidebar-mobile"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed inset-0 z-50 bg-white lg:hidden"
            >
              {/* Mobile Header with Back Button */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
                <button
                  onClick={() => setShowRightSidebar(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Back"
                >
                  <FaArrowLeft className="w-5 h-5 text-gray-700" />
                </button>
                <h2 className="text-lg font-semibold text-gray-800">
                  Thông tin
                </h2>
              </div>
              <div className="h-[calc(100vh-60px)] overflow-y-auto">
                <RightSidebar />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default HomePage;
