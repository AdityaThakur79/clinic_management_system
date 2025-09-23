import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/common/Uploads.js";
import { 
  getUserProfileController, 
  loginController, 
  logoutController, 
  registerController, 
  updateProfileController, 
  verifyOTPController,
  forgotPasswordController,
  verifyPasswordResetOTPController,
  resetPasswordController,
  changePasswordController
} from "../controllers/user.js";

const router = express.Router();

//register
router.post("/register", registerController);

//verify-otp
router.post("/verify-otp", verifyOTPController);

//login
router.post("/login", loginController);

//forgot password
router.post("/forgot-password", forgotPasswordController);

//verify password reset OTP
router.post("/verify-password-reset-otp", verifyPasswordResetOTPController);

//reset password
router.post("/reset-password", resetPasswordController);

//change password (authenticated users)
router.put("/change-password", isAuthenticated, changePasswordController);

//logout
router.get("/logout", logoutController);

//profile
router.get("/profile", isAuthenticated, getUserProfileController);

//update profile
router.put("/update-profile", isAuthenticated, upload, updateProfileController);

export default router;
