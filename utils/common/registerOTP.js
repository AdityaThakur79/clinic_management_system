import nodemailer from "nodemailer";
import { registerOTPTemplate } from "../emailTemplate/resgiterTemplate.js";
import dotenv from "dotenv";

// configing the dotenv file
dotenv.config();

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Create transporter with better error handling
const createTransporter = () => {
  // Support both old and new environment variable names
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  
  // Check if email credentials are configured
  if (!emailUser || !emailPass) {
    throw new Error("Email credentials not configured. Please set SMTP_USER and SMTP_PASS environment variables.");
  }

  // For Gmail, you need to use an App Password if 2FA is enabled
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass, // This should be an App Password, not your regular password
    },
    // Add additional options for better reliability
    secure: true, // Use SSL
    port: 465, // Gmail SMTP port
    tls: {
      rejectUnauthorized: false // For development, remove in production
    }
  });

  return transporter;
};

// Verify transporter connection
const verifyTransporter = async (transporter) => {
  try {
    await transporter.verify();
    console.log("Email transporter verified successfully");
    return true;
  } catch (error) {
    console.error("Email transporter verification failed:", error);
    return false;
  }
};

// Function to send OTP via email
export const sendOTPEmail = async (name, email, otp) => {
  try {
    const transporter = createTransporter();
    
    // Verify connection before sending
    const isVerified = await verifyTransporter(transporter);
    if (!isVerified) {
      throw new Error("Email service not available");
    }

    const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    
    let mailOptions = {
      from: emailUser,
      to: email,
      subject: "Your Registration OTP Code",
      html: registerOTPTemplate(name, otp),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};
