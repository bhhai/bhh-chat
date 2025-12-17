import React, { useContext, useEffect, useState, useMemo } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import { useMessages } from "../hooks/useMessages";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { formatLastActive } from "../lib/utils";
import { FaCheck } from "react-icons/fa";
import toast from "react-hot-toast";
import OptimizedImage from "./Image";

const RightSidebar = () => {
  const { selectedUser } = useContext(ChatContext);
  const {
    logout,
    onlineUsers,
    authUser,
    updateChatBackground,
    updateChatBackgroundImage,
  } = useContext(AuthContext);
  const [msgImages, setMsgImages] = useState([]);
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState(null);
  const [isUpdatingBackground, setIsUpdatingBackground] = useState(false);
  const [isUpdatingBackgroundImage, setIsUpdatingBackgroundImage] =
    useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get messages using TanStack Query
  const { data: messagesData } = useMessages(selectedUser?._id);

  // Flatten messages from all pages
  const messages = useMemo(() => {
    if (!messagesData?.pages) return [];
    return messagesData.pages.flatMap((page) => page.messages);
  }, [messagesData]);

  // Get current conversation theme
  const getCurrentTheme = () => {
    if (!selectedUser || !authUser?.chatThemes) {
      return "gradient-indigo-blue"; // Default
    }
    // Convert Map to object if needed, or access directly
    const themes = authUser.chatThemes;
    if (themes instanceof Map) {
      return themes.get(selectedUser._id) || "gradient-indigo-blue";
    } else if (typeof themes === "object") {
      return themes[selectedUser._id] || "gradient-indigo-blue";
    }
    return "gradient-indigo-blue";
  };

  const currentTheme = getCurrentTheme();

  // Background options
  const backgroundOptions = [
    {
      id: "gradient-indigo-blue",
      name: "Default",
      className: "bg-gradient-to-br from-indigo-50 to-blue-50",
    },
    {
      id: "gradient-purple-pink",
      name: "Purple Pink",
      className: "bg-gradient-to-br from-purple-50 to-pink-50",
    },
    {
      id: "gradient-green-blue",
      name: "Green Blue",
      className: "bg-gradient-to-br from-green-50 to-blue-50",
    },
    {
      id: "gradient-orange-red",
      name: "Orange Red",
      className: "bg-gradient-to-br from-orange-50 to-red-50",
    },
    {
      id: "gradient-yellow-orange",
      name: "Yellow Orange",
      className: "bg-gradient-to-br from-yellow-50 to-orange-50",
    },
    {
      id: "solid-white",
      name: "White",
      className: "bg-white",
    },
    {
      id: "solid-gray",
      name: "Gray",
      className: "bg-gray-50",
    },
    {
      id: "solid-blue",
      name: "Blue",
      className: "bg-blue-50",
    },
  ];

  useEffect(() => {
    setMsgImages(
      messages?.filter((msg) => msg?.image)?.map((msg) => msg?.image)
    );
  }, [messages]);

  return (
    selectedUser && (
      <>
        {/* Full Screen Loading Backdrop */}
        <AnimatePresence>
          {(isUpdatingBackground || isUpdatingBackgroundImage) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[280px]"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">
                    {isUpdatingBackgroundImage
                      ? "Uploading theme..."
                      : "Updating theme..."}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Please wait while we update your chat background
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white text-gray-800 w-full h-full flex flex-col border-l border-gray-100 shadow-sm"
        >
          {/* Profile Section */}
          <div className="pt-6 sm:pt-8 px-4 sm:px-6 flex flex-col items-center gap-3 text-sm font-light">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <OptimizedImage
                src={selectedUser?.profilePic || assets.avatar_icon}
                alt={selectedUser?.fullName || "User"}
                width={96}
                height={96}
                className="w-24 rounded-full border-2 border-white shadow-md"
                objectFit="cover"
                priority
              />
              {onlineUsers.includes(selectedUser._id) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white"
                />
              )}
            </motion.div>

            <motion.h1
              className="text-xl font-semibold flex items-center gap-2"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {selectedUser.fullName}
            </motion.h1>

            <motion.p
              className="text-sm text-gray-500"
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
            >
              {onlineUsers.includes(selectedUser._id)
                ? "Online"
                : selectedUser.lastActive
                ? formatLastActive(selectedUser.lastActive)
                : "Offline"}
            </motion.p>

            {selectedUser.bio && (
              <motion.p
                className="text-gray-600 text-center max-w-xs"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {selectedUser.bio}
              </motion.p>
            )}
          </div>

          <hr className="border-gray-100 my-4 sm:my-6 mx-4 sm:mx-6" />

          {/* Chat Background Section */}
          <div className="px-4 sm:px-6">
            <motion.h3
              className="text-sm font-medium text-gray-700 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              Chat Background
            </motion.h3>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-4 gap-2 mb-4 relative"
            >
              {(isUpdatingBackground || isUpdatingBackgroundImage) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent"></div>
                    <p className="text-xs text-gray-600">Updating...</p>
                  </div>
                </motion.div>
              )}
              {backgroundOptions.map((bg) => (
                <motion.button
                  key={bg.id}
                  whileHover={
                    isUpdatingBackground || isUpdatingBackgroundImage
                      ? {}
                      : { scale: 1.05 }
                  }
                  whileTap={
                    isUpdatingBackground || isUpdatingBackgroundImage
                      ? {}
                      : { scale: 0.95 }
                  }
                  onClick={async () => {
                    if (
                      selectedUser &&
                      !isUpdatingBackground &&
                      !isUpdatingBackgroundImage
                    ) {
                      setIsUpdatingBackground(true);
                      try {
                        await updateChatBackground(bg.id, selectedUser._id);
                        setSelectedBackgroundImage(null);
                      } finally {
                        setIsUpdatingBackground(false);
                      }
                    }
                  }}
                  disabled={isUpdatingBackground || isUpdatingBackgroundImage}
                  className={`relative h-12 rounded-lg border-2 transition-all ${
                    isUpdatingBackground || isUpdatingBackgroundImage
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  } ${
                    currentTheme === bg.id && !currentTheme?.startsWith("http")
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  } ${bg.className}`}
                  title={bg.name}
                >
                  {currentTheme === bg.id &&
                    !currentTheme?.startsWith("http") && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                      >
                        <FaCheck className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  {(isUpdatingBackground || isUpdatingBackgroundImage) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    </div>
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Upload Image Option */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="mb-4"
            >
              <label
                htmlFor="background-image-upload"
                className={`block w-full ${
                  isUpdatingBackground || isUpdatingBackgroundImage
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                }`}
              >
                <div
                  className={`relative h-12 rounded-lg border-2 transition-all flex items-center justify-center ${
                    currentTheme?.startsWith("http")
                      ? "border-blue-500 shadow-md bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50"
                  } ${
                    isUpdatingBackground || isUpdatingBackgroundImage
                      ? "pointer-events-none"
                      : ""
                  }`}
                >
                  {selectedBackgroundImage ? (
                    <>
                      <OptimizedImage
                        src={URL.createObjectURL(selectedBackgroundImage)}
                        alt="Background preview"
                        className="w-full h-full rounded-lg"
                        objectFit="cover"
                      />
                      {currentTheme?.startsWith("http") &&
                        !isUpdatingBackgroundImage && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <FaCheck className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      {isUpdatingBackgroundImage && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center backdrop-blur-sm"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            <span className="text-white text-xs">
                              Uploading...
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : currentTheme?.startsWith("http") ? (
                    <>
                      <OptimizedImage
                        src={currentTheme}
                        alt="Current background"
                        className="w-full h-full rounded-lg"
                        objectFit="cover"
                      />
                      {!isUpdatingBackgroundImage && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                        >
                          <FaCheck className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                      {isUpdatingBackgroundImage && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center backdrop-blur-sm"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                            <span className="text-white text-xs">
                              Uploading...
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 text-xs relative">
                      {isUpdatingBackground || isUpdatingBackgroundImage ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent mb-1"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mb-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Upload Image</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <input
                  id="background-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUpdatingBackground || isUpdatingBackgroundImage}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (!file.type.startsWith("image/")) {
                        toast.error("Please select an image file");
                        return;
                      }
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Image size should be less than 5MB");
                        return;
                      }
                      if (
                        selectedUser &&
                        !isUpdatingBackgroundImage &&
                        !isUpdatingBackground
                      ) {
                        setSelectedBackgroundImage(file);
                        setIsUpdatingBackgroundImage(true);
                        try {
                          await updateChatBackgroundImage(
                            file,
                            selectedUser._id
                          );
                        } catch (error) {
                          console.error(
                            "Error updating background image:",
                            error
                          );
                          // Error already handled in updateChatBackgroundImage
                        } finally {
                          setIsUpdatingBackgroundImage(false);
                        }
                      }
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </motion.div>
          </div>

          <hr className="border-gray-100 my-4 sm:my-6 mx-4 sm:mx-6" />

          {/* Media Section */}
          <div className="px-4 sm:px-6 flex-1 overflow-y-auto">
            <motion.h3
              className="text-sm font-medium text-gray-700 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
            >
              Shared Media
            </motion.h3>

            <AnimatePresence>
              {msgImages?.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {msgImages?.map((url, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => window.open(url)}
                      className="cursor-pointer rounded-lg overflow-hidden aspect-square bg-gray-100"
                    >
                      <OptimizedImage
                        src={url}
                        alt="Shared media"
                        className="w-full h-full transition-all hover:opacity-90"
                        objectFit="cover"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center justify-center py-8 text-gray-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm">No media shared yet</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout Button */}
          <motion.div
            className="sticky bottom-0 w-full p-4 sm:p-6 bg-white border-t border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => {
                if (
                  !isLoggingOut &&
                  !isUpdatingBackground &&
                  !isUpdatingBackgroundImage
                ) {
                  setIsLoggingOut(true);
                  logout();
                  // Reset after a short delay since logout is synchronous
                  setTimeout(() => setIsLoggingOut(false), 500);
                }
              }}
              disabled={
                isLoggingOut ||
                isUpdatingBackground ||
                isUpdatingBackgroundImage
              }
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium text-sm py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${
                isLoggingOut ||
                isUpdatingBackground ||
                isUpdatingBackgroundImage
                  ? "opacity-75 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoggingOut ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  Logout
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </motion.div>
        </motion.div>
      </>
    )
  );
};

export default RightSidebar;
