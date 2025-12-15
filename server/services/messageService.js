import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

/**
 * Service to get all users for sidebar (except logged in user)
 * @param {string} userId - Logged in user ID
 * @returns {Promise<Object>} - Returns users with unseen messages count and last message time
 */
export const getUsersForSidebar = async (userId) => {
  const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
    "-password"
  );

  // Count the number of messages not seen
  const unseenMessages = {};
  // Store last message time for each user
  const userLastMessageMap = {};

  const promises = filteredUsers.map(async (user) => {
    // Count unseen messages
    const messages = await Message.find({
      sender: user._id,
      receiver: userId,
      seen: false,
    });
    if (messages.length > 0) {
      unseenMessages[user._id] = messages.length;
    }

    // Find the latest message exchanged with this user
    const lastMsg = await Message.findOne({
      $or: [
        { sender: userId, receiver: user._id },
        { sender: user._id, receiver: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .select("createdAt");
    userLastMessageMap[user._id] = lastMsg ? lastMsg.createdAt : null;
  });

  await Promise.all(promises);

  // Attach lastMessageAt to each user
  const usersWithLastMsg = filteredUsers.map((user) => {
    const u = user.toObject();
    u.lastMessageAt = userLastMessageMap[user._id] || null;
    return u;
  });

  return {
    users: usersWithLastMsg,
    unseenMessages,
  };
};

/**
 * Service to get all messages between two users with pagination
 * @param {string} myId - Current user ID
 * @param {string} selectedUserId - Selected user ID
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Number of messages per page (default: 50)
 * @returns {Promise<Object>} - Returns object with messages, total, page, limit, hasMore
 */
export const getMessages = async (
  myId,
  selectedUserId,
  page = 1,
  limit = 50
) => {
  const skip = (page - 1) * limit;

  const query = {
    $or: [
      { sender: myId, receiver: selectedUserId },
      { sender: selectedUserId, receiver: myId },
    ],
  };

  // Get total count
  const total = await Message.countDocuments(query);

  // Get messages with pagination, sorted by createdAt descending (newest first)
  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Mark messages as seen (only for first page)
  if (page === 1) {
    await Message.updateMany(
      { sender: selectedUserId, receiver: myId, seen: false },
      { seen: true }
    );
  }

  const hasMore = skip + messages.length < total;

  return {
    messages,
    total,
    page,
    limit,
    hasMore,
  };
};

/**
 * Service to get message by ID
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Returns message object
 */
export const getMessageById = async (messageId) => {
  const message = await Message.findById(messageId)
    .populate("sender", "fullName profilePic")
    .populate("receiver", "fullName profilePic")
    .lean();

  if (!message) {
    throw new Error("Message not found");
  }

  return message;
};

/**
 * Service to mark a message as seen
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} - Returns updated message
 */
export const markMessageAsSeen = async (messageId) => {
  const message = await Message.findByIdAndUpdate(messageId, { seen: true });
  if (!message) {
    throw new Error("Message not found");
  }
  return message;
};

/**
 * Service to send a message
 * @param {string} senderId - Sender user ID
 * @param {string} receiverId - Receiver user ID
 * @param {Object} messageData - Message data (text, imageFile)
 * @returns {Promise<Object>} - Returns created message
 */
export const sendMessage = async (senderId, receiverId, messageData) => {
  const { text, imageFile } = messageData;

  if (!text && !imageFile) {
    throw new Error("Message cannot be empty.");
  }

  let imageUrl = "";

  // Upload image to Cloudinary if provided
  if (imageFile) {
    try {
      // Convert buffer to base64 for Cloudinary
      const base64Image = `data:${
        imageFile.mimetype
      };base64,${imageFile.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "chat-messages",
        resource_type: "image",
      });

      imageUrl = uploadResponse.secure_url;
    } catch (error) {
      throw new Error("Failed to upload image: " + error.message);
    }
  }

  const newMessage = new Message({
    sender: senderId,
    receiver: receiverId,
    text,
    image: imageUrl,
  });

  await newMessage.save();

  return newMessage;
};

/**
 * Service to delete a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID requesting deletion
 * @returns {Promise<Object>} - Returns deleted message
 */
export const deleteMessage = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  if (String(message.sender) !== String(userId)) {
    throw new Error("Not authorized to delete this message");
  }

  message.deleted = true;
  message.text = "This message was deleted";
  message.image = "";
  await message.save();

  return message;
};

/**
 * Service to add or remove a reaction to a message
 * @param {string} messageId - Message ID
 * @param {string} userId - User ID adding/removing reaction
 * @param {string} emoji - Emoji to add/remove
 * @returns {Promise<Object>} - Returns updated message
 */
export const toggleReaction = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error("Message not found");
  }

  // Check if user already reacted with this emoji
  const existingReactionIndex = message.reactions.findIndex(
    (reaction) =>
      String(reaction.userId) === String(userId) && reaction.emoji === emoji
  );

  if (existingReactionIndex !== -1) {
    // Remove reaction if it exists
    message.reactions.splice(existingReactionIndex, 1);
  } else {
    // Add reaction if it doesn't exist
    message.reactions.push({ emoji, userId });
  }

  await message.save();
  return message;
};
