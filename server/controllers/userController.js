import {
  signupUser,
  loginUser,
  updateUserProfile,
} from "../services/userService.js";

/**
 * Controller to signup a new user
 */
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;
    const { user, token } = await signupUser({
      fullName,
      email,
      password,
      bio,
    });

    res.json({
      success: true,
      newUser: user,
      token,
      message: "User created successfully",
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
 * Controller to login a user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser(email, password);

    res.json({
      success: true,
      userData: user,
      token,
      message: "Login successful",
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
 * Controller to check if user is authenticated
 */
export const checkAuth = (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
};

/**
 * Controller to update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic, bio, fullName } = req.body;
    const userId = req.user._id;

    const updatedUser = await updateUserProfile(userId, {
      profilePic,
      bio,
      fullName,
    });

    res.json({
      success: true,
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log(error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
};
