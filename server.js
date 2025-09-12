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
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
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

app.use("/api/user", userRoutes);
app.use("/api/branch", branchRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/branch-admin", branchAdminRoutes);
app.use("/api/service", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/referred-doctors", referredDoctorRoutes);
app.use("/api/patients", patientRoutes);

// Serve static files from uploads directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from client build directory (if it exists)
const clientDistPath = path.join(__dirname, "./client/dist");
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
  console.log(`Server is running at ${PORT}`);
});
