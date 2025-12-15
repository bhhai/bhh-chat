import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { uploadImage } from "../middleware/upload.js";
import {
  getMessages,
  getUsersForSidebar,
  markMessagesAsSeen,
  sendMessage,
  deleteMessage,
  toggleReaction,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessagesAsSeen);
messageRouter.post(
  "/send/:id",
  protectRoute,
  uploadImage,
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  },
  sendMessage
);
messageRouter.delete("/:id", protectRoute, deleteMessage);
messageRouter.post("/reaction/:id", protectRoute, toggleReaction);

export default messageRouter;
