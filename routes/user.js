import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/common/Uploads.js";
import { getUserProfileController, loginController, logoutController, registerController, updateProfileController, verifyOTPController } from "../controllers/user.js";

const router = express.Router();

//register
router.post("/register", registerController);

//verify-otp
router.post("/verify-otp", verifyOTPController);

//login
router.post("/login", loginController);

//forgotpassword

//logout
router.get("/logout", logoutController);

//profile
router.get("/profile", isAuthenticated, getUserProfileController);

//update profile
router.put("/update-profile", isAuthenticated, upload, updateProfileController);

export default router;
