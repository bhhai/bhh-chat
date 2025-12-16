import {
  getUsersForSidebar as getUsersForSidebarService,
  getMessages as getMessagesService,
  markMessageAsSeen as markMessageAsSeenService,
  sendMessage as sendMessageService,
  deleteMessage as deleteMessageService,
  toggleReaction as toggleReactionService,
  getMessageById as getMessageByIdService,
} from "../services/messageService.js";
import { io, userSocketMap } from "../server.js";
import { uploadImage } from "../middleware/upload.js";

/**
 * Controller to get all users for sidebar (except logged in user)
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const { users, unseenMessages } = await getUsersForSidebarService(userId);

    res.json({
      success: true,
      users,
      unseenMessages,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Controller to get all messages for selected user with pagination
 */
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const myId = req.user._id;
    const result = await getMessagesService(myId, selectedUserId, page, limit);

    res.json({
      success: true,
      messages: result.messages,
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.hasMore,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Controller to get message by ID
 */
export const getMessageDetail = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const message = await getMessageByIdService(messageId);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Controller to mark a message as seen
 */
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedMessage = await markMessageAsSeenService(id);

    // Emit socket event to notify sender that message was seen
    // Handle both ObjectId and populated object
    const senderId =
      typeof updatedMessage.sender === "object" &&
      updatedMessage.sender !== null
        ? updatedMessage.sender._id || updatedMessage.sender
        : updatedMessage.sender;
    const senderSocketId = userSocketMap[senderId];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", updatedMessage);
    }

    res.json({
      success: true,
      message: "Message marked as seen",
      data: updatedMessage,
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Controller to send a message
 */
export const sendMessage = async (req, res) => {
  try {
    const sender = req.user._id;
    const receiver = req.params.id;
    const { text } = req.body;
    const imageFile = req.file;

    if (!receiver) {
      return res.status(400).json({ message: "Receiver is required." });
    }

    // Create message using service
    const newMessage = await sendMessageService(sender, receiver, {
      text,
      imageFile,
    });

    // Populate sender and receiver fields for socket emission
    await newMessage.populate("sender receiver");

    // Emit the new message to both sender and receiver (real-time communication)
    const senderSocketId = userSocketMap[sender];
    const receiverSocketId = userSocketMap[receiver];

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json({
      success: true,
      message: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Controller to delete a message
 */
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    // Delete message using service
    const deletedMessage = await deleteMessageService(id, userId);

    // Emit update to both sender and receiver (real-time communication)
    const senderSocketId = userSocketMap[deletedMessage.sender];
    const receiverSocketId = userSocketMap[deletedMessage.receiver];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageDeleted", deletedMessage);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", deletedMessage);
    }

    res.json({
      success: true,
      message: "Message deleted",
      data: deletedMessage,
    });
  } catch (error) {
    const statusCode =
      error.message === "Message not found"
        ? 404
        : error.message === "Not authorized to delete this message"
        ? 403
        : 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

/**
 * Controller to toggle a reaction on a message
 */
export const toggleReaction = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res
        .status(400)
        .json({ success: false, message: "Emoji is required" });
    }

    // Toggle reaction using service
    const updatedMessage = await toggleReactionService(
      messageId,
      userId,
      emoji
    );

    // Emit update to both sender and receiver (real-time communication)
    const senderSocketId = userSocketMap[updatedMessage.sender];
    const receiverSocketId = userSocketMap[updatedMessage.receiver];
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReactionUpdated", updatedMessage);
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReactionUpdated", updatedMessage);
    }

    res.json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    const statusCode = error.message === "Message not found" ? 404 : 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};
