import { User } from "../models/user.js";
import { generateOTP, sendOTPEmail } from "../utils/common/registerOTP.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/common/generateToken.js";
import { v2 as cloudinary } from "cloudinary";

const pendingUsers = new Map();

export const registerController = async (req, res) => {
  try {
    //   const { error } = User.validate(req.body);
    //   if (error) {
    //     return res
    //       .status(400)
    //       .send({ message: "Validation Error", details: error.details });
    //   }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    // Check if a pending user already exists for this email
    if (pendingUsers.has(email)) {
      return res.status(400).json({
        success: false,
        message: "OTP already sent. Please verify your email.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user directly without OTP verification
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      status: true, // Set as active immediately
    });

    return res.status(200).json({
      success: true,
      message: "Account created successfully! You can now sign in.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register",
    });
  }
};

//update profile
export const updateProfileController = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;

    if (!name) {
      return res.status(500).send({
        message: "All field is required",
        success: false,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User Not Found" });
    }
    let photoUrl;
    let photoUrlPublicId;
    let bannerUrl;
    let bannerUrlPublicId;

    if (req.files && req.files.profilePhoto) {
      if (user.photoUrlPublicId) {
        await cloudinary.uploader.destroy(user.photoUrlPublicId)
      }
      photoUrl = req.files.profilePhoto[0].path;
      photoUrlPublicId = req.files.profilePhoto[0].filename;
    }

    if (req.files && req.files.bannerImage) {
      if (user.bannerUrlPublicId) {
        await cloudinary.uploader.destroy(user.bannerUrlPublicId)
      }
      bannerUrl = req.files.bannerImage[0].path;
      bannerUrlPublicId = req.files.bannerImage[0].filename
    }
    const updatedData = { name };
    if (photoUrl) { updatedData.photoUrl = photoUrl; updatedData.photoUrlPublicId = photoUrlPublicId }
    if (bannerUrl) { updatedData.bannerUrl = bannerUrl; updatedData.bannerUrlPublicId = bannerUrlPublicId }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.log("=== ERROR ===");
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" ,  error: error.message });
  }
};

//Get User Profile
export const getUserProfileController = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "Profile not found",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user",
    });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ sucess: false, messsage: "All fields are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect email or password" });
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password",
      });
    }
    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
};

// Verify OTP Controller
export const verifyOTPController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    // Check if the email exists in pending users
    if (!pendingUsers.has(email)) {
      return res
        .status(400)
        .json({ message: "No registration found for this email" });
    }

    const pendingUser = pendingUsers.get(email);

    // Validate OTP
    if (pendingUser.otp !== otp || Date.now() > pendingUser.otpExpiry) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Create the user in the database
    const newUser = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.hashedPassword,
      status: true,
    });

    // Remove the user from pending list
    pendingUsers.delete(email);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. User registered!",
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
 
export const logoutController = async (req, res) => {
  try {
    return res.status(200).cookie("token", "", { maxAge: 0 }).json({
      message: "Logged Out Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to Log out",
    });
  }
};