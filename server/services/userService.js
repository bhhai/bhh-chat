import User from "../models/User.js";
import bcrypt from "bcrypt";
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";

/**
 * Service to handle user signup
 * @param {Object} userData - User data containing fullName, email, password, bio
 * @returns {Promise<Object>} - Returns user object and token
 */
export const signupUser = async (userData) => {
  const { fullName, email, password, bio } = userData;

  // Validation
  if (!fullName || !email || !password) {
    throw new Error("Please fill all the fields");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
    bio,
  });

  // Generate token
  const token = generateToken(newUser._id);

  return {
    user: newUser,
    token,
  };
};

/**
 * Service to handle user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - Returns user object and token
 */
export const loginUser = async (email, password) => {
  const userData = await User.findOne({ email });

  if (!userData) {
    throw new Error("User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(password, userData.password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid password");
  }

  const token = generateToken(userData._id);

  return {
    user: userData,
    token,
  };
};

/**
 * Service to update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update (profilePic, bio, fullName)
 * @returns {Promise<Object>} - Returns updated user object
 */
export const updateUserProfile = async (userId, updateData) => {
  const {
    profilePic,
    bio,
    fullName,
    chatBackground,
    chatBackgroundImage,
    conversationUserId,
    chatTheme,
    chatThemeImage,
  } = updateData;

  let dataToUpdate = { bio, fullName };

  // Handle chat theme for specific conversation
  if (conversationUserId && (chatTheme !== undefined || chatThemeImage)) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get existing themes (Map or object)
    let themes = user.chatThemes;
    if (!themes) {
      themes = new Map();
    } else if (!(themes instanceof Map)) {
      // Convert object to Map if needed
      themes = new Map(Object.entries(themes));
    }

    // Upload chat theme image to cloudinary if provided
    if (chatThemeImage) {
      const uploadResponse = await cloudinary.uploader.upload(chatThemeImage, {
        folder: "chat-backgrounds",
      });
      themes.set(conversationUserId, uploadResponse.secure_url);
    } else if (chatTheme !== undefined) {
      themes.set(conversationUserId, chatTheme);
    }

    dataToUpdate.chatThemes = themes;
  }

  // Legacy support: Add chatBackground if provided (for backward compatibility)
  if (chatBackground !== undefined) {
    dataToUpdate.chatBackground = chatBackground;
  }

  // Legacy support: Upload chat background image to cloudinary if provided
  if (chatBackgroundImage) {
    const uploadResponse = await cloudinary.uploader.upload(
      chatBackgroundImage,
      {
        folder: "chat-backgrounds",
      }
    );
    dataToUpdate.chatBackground = uploadResponse.secure_url;
  }

  // Upload profile picture to cloudinary if provided
  if (profilePic) {
    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    dataToUpdate.profilePic = uploadResponse.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(userId, dataToUpdate, {
    new: true,
  });

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

/**
 * Service to get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Returns user object
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

/**
 * Service to update user last active time
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Returns updated user object
 */
export const updateLastActive = async (userId) => {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { lastActive: new Date() },
    { new: true }
  ).select("-password");

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};
