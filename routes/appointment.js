import express from "express";
import { createAppointment, getAvailability, getMultipleDateAvailability, getAllAppointments, getTodayAppointments, getAppointmentById, updateAppointmentStatus, updateAppointmentTimeSlot, assignDoctorToAppointment, deleteAppointment, resendAppointmentConfirmation, sendAppointmentReminderNow } from "../controllers/appointment.js";
import { addAppointmentCommission } from "../controllers/appointmentCommission.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Public routes
router.get("/availability", getAvailability);
router.get("/availability/multiple", getMultipleDateAvailability);
router.post("/", createAppointment);

// Protected routes
router.get("/", isAuthenticated, getAllAppointments);
router.get("/today", isAuthenticated, getTodayAppointments);
router.get("/:id", isAuthenticated, getAppointmentById);
router.patch("/:id/status", isAuthenticated, updateAppointmentStatus);
router.patch("/:id/timeslot", isAuthenticated, updateAppointmentTimeSlot);
router.post("/assign-doctor", isAuthenticated, assignDoctorToAppointment);
router.delete("/:id", isAuthenticated, deleteAppointment);

// Test utilities (protected)
router.post("/:id/send-confirmation", isAuthenticated, resendAppointmentConfirmation);
router.post("/:id/send-reminder", isAuthenticated, sendAppointmentReminderNow);

// Commission management routes
router.post("/:id/commission", isAuthenticated, addAppointmentCommission);

export default router;
