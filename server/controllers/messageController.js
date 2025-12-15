import {
  getUsersForSidebar as getUsersForSidebarService,
  getMessages as getMessagesService,
  markMessageAsSeen as markMessageAsSeenService,
  sendMessage as sendMessageService,
  deleteMessage as deleteMessageService,
  toggleReaction as toggleReactionService,
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
 * Controller to get all messages for selected user
 */
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await getMessagesService(myId, selectedUserId);

    res.json({
      success: true,
      messages,
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
    await markMessageAsSeenService(id);

    res.json({
      success: true,
      message: "Message marked as seen",
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

    // Emit the new message to the receiver's socket (real-time communication)
    const receiverSocketId = userSocketMap[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(200).json(newMessage);
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
