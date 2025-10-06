import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import connectDB from "./config/dbConfig.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      "http://localhost:5174",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8080",
      "https://aartiket-speech-and-hearing-care.onrender.com",
      "https://aartiketspeechandhearingcare.in"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());
app.use(cookieParser());

//User Auth routes
import userRoutes from "./routes/user.js";
import branchRoutes from "./routes/branch.js";
import doctorRoutes from "./routes/doctor.js";
import branchAdminRoutes from "./routes/branchAdmin.js";
import serviceRoutes from "./routes/service.js";
import appointmentRoutes from "./routes/appointment.js";
import referredDoctorRoutes from "./routes/referredDoctor.js";
import patientRoutes from "./routes/patient.js";
import reminderRoutes from "./routes/reminder.js";
import analyticsRoutes from "./routes/analytics.js";
import billRoutes from "./routes/bill.js";
import inventoryRoutes from "./routes/inventory.js";
import searchRoutes from "./routes/search.js";
import enquiryRoutes from "./routes/enquiry.js";
import settingsRoutes from "./routes/settings.js";
import blogRoutes from "./routes/blog.js";

// Import email utilities for health check
import { sendEmail } from "./utils/common/sendMail.js";

app.use("/api/user", userRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/branch-admin", branchAdminRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/referred-doctors", referredDoctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/blogs", blogRoutes);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Email health check endpoint
app.get("/api/health/email", async (req, res) => {
  try {
    console.log('[HEALTH] Testing email configuration...');
    
    // Check environment variables
    const emailConfig = {
      smtpUser: process.env.SMTP_USER || process.env.EMAIL_USER,
      smtpPass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      smtpHost: process.env.SMTP_HOST,
      smtpPort: process.env.SMTP_PORT,
      smtpSecure: process.env.SMTP_SECURE,
      superAdminEmail: process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL
    };

    console.log('[HEALTH] Email configuration:', {
      smtpUser: emailConfig.smtpUser ? '***provided***' : '***missing***',
      smtpPass: emailConfig.smtpPass ? '***provided***' : '***missing***',
      smtpHost: emailConfig.smtpHost || 'not set (using Gmail)',
      smtpPort: emailConfig.smtpPort || 'not set (using default)',
      smtpSecure: emailConfig.smtpSecure || 'not set (using default)',
      superAdminEmail: emailConfig.superAdminEmail || 'not set'
    });

    // Check if basic email credentials are available
    if (!emailConfig.smtpUser || !emailConfig.smtpPass) {
      return res.status(400).json({
        success: false,
        message: "Email credentials not configured",
        config: emailConfig,
        required: ['SMTP_USER (or EMAIL_USER)', 'SMTP_PASS (or EMAIL_PASS)']
      });
    }

    // Test email sending (only if test email is provided)
    const testEmail = req.query.test;
    if (testEmail) {
      console.log('[HEALTH] Sending test email to:', testEmail);
      await sendEmail({
        to: testEmail,
        subject: 'Health Check - Email Test',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2B5A8A;">Email Health Check</h2>
            <p>This is a test email to verify that email functionality is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
            <p>If you received this email, the email system is working properly!</p>
          </div>
        `
      });
      console.log('[HEALTH] Test email sent successfully!');
    }

    res.json({
      success: true,
      message: testEmail ? "Test email sent successfully" : "Email configuration is valid",
      config: {
        smtpUser: emailConfig.smtpUser ? '***provided***' : '***missing***',
        smtpPass: emailConfig.smtpPass ? '***provided***' : '***missing***',
        smtpHost: emailConfig.smtpHost || 'Gmail (default)',
        smtpPort: emailConfig.smtpPort || '587/465 (default)',
        smtpSecure: emailConfig.smtpSecure || 'auto (default)',
        superAdminEmail: emailConfig.superAdminEmail || 'not set'
      },
      testEmail: testEmail || 'not provided (add ?test=your-email@example.com to test)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[HEALTH] Email health check failed:', error);
    res.status(500).json({
      success: false,
      message: "Email health check failed",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
});

// Test different Gmail configurations
app.get("/api/test/gmail", async (req, res) => {
  const nodemailer = await import('nodemailer');
  const testEmail = req.query.test;
  const results = [];

  // Test configurations
  const configs = [
    {
      name: "Service-based (port 465)",
      config: {
        service: "gmail",
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
        secure: true,
        port: 465,
        tls: { rejectUnauthorized: false }
      }
    },
    {
      name: "Host-based (port 465)",
      config: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false }
      }
    },
    {
      name: "Host-based (port 587)",
      config: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
        tls: { rejectUnauthorized: false }
      }
    }
  ];

  for (const { name, config } of configs) {
    try {
      console.log(`[GMAIL_TEST] Testing ${name}...`);
      const transporter = nodemailer.createTransport(config);
      
      // Test connection with timeout
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      
      if (testEmail) {
        const result = await transporter.sendMail({
          from: process.env.SMTP_USER || process.env.EMAIL_USER,
          to: testEmail,
          subject: `Gmail Test - ${name}`,
          html: `<h1>Gmail Test Successful!</h1><p>Configuration: ${name}</p>`
        });
        results.push({ name, status: 'success', messageId: result.messageId });
      } else {
        results.push({ name, status: 'success', message: 'Connection verified' });
      }
      
      console.log(`[GMAIL_TEST] ${name} - SUCCESS`);
      break; // Stop on first success
      
    } catch (error) {
      console.log(`[GMAIL_TEST] ${name} - FAILED:`, error.message);
      results.push({ name, status: 'failed', error: error.message });
    }
  }

  const successCount = results.filter(r => r.status === 'success').length;
  
  res.json({
    success: successCount > 0,
    message: successCount > 0 ? "At least one Gmail configuration works!" : "All Gmail configurations failed",
    results,
    testEmail: testEmail || 'not provided (add ?test=your-email@example.com to test)',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from client build directory (if it exists)
const clientDistPath = path.join(__dirname, "./client/build");
const clientDistExists = existsSync(clientDistPath);

if (clientDistExists) {
  app.use(express.static(clientDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  // If no build exists, serve a simple message for API routes
  app.get("*", (req, res) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ success: false, message: "API endpoint not found" });
    } else {
      res.status(200).json({ 
        message: "Server is running. Please build the React app first with 'npm run build' in the client directory.",
        apiEndpoints: [
          "GET /api/appointments/availability",
          "POST /api/appointments",
          "GET /api/referred-doctors",
          "POST /api/referred-doctors"
        ]
      });
    }
  });
}

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
  console.log(` API endpoints available at: http://localhost:${PORT}/api`);
});
