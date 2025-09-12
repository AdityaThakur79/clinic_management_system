import express from "express";
import { createAppointment, getAvailability, getAllAppointments, getTodayAppointments, updateAppointmentStatus, deleteAppointment } from "../controllers/appointment.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Public routes
router.get("/availability", getAvailability);
router.post("/", createAppointment);

// Protected routes
router.get("/", isAuthenticated, getAllAppointments);
router.get("/today", isAuthenticated, getTodayAppointments);
router.patch("/:id/status", isAuthenticated, updateAppointmentStatus);
router.delete("/:id", isAuthenticated, deleteAppointment);

export default router;


