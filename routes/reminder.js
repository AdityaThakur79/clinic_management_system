import express from "express";
import {
  getAllReminders,
  getTodayReminders,
  getRemindersByDateRange,
  getReminderById,
  createReminder,
  updateReminder,
  updateReminderStatus,
  markReminderCompleted,
  deleteReminder,
  sendReminder,
  getReminderSettings,
  updateReminderSettings,
  processUpcomingReminders
} from "../controllers/reminder.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isSuperAdmin } from "../middlewares/isSuperAdmin.js";

const router = express.Router();

// All routes are protected
router.get("/", isAuthenticated, getAllReminders);
router.get("/today", isAuthenticated, getTodayReminders);
router.get("/date-range", isAuthenticated, getRemindersByDateRange);
router.get("/:id", isAuthenticated, getReminderById);
router.post("/", isAuthenticated, createReminder);
router.put("/:id", isAuthenticated, updateReminder);
router.patch("/:id/status", isAuthenticated, updateReminderStatus);
router.patch("/:id/complete", isAuthenticated, markReminderCompleted);
router.delete("/:id", isAuthenticated, deleteReminder);
router.post("/:id/send", isAuthenticated, sendReminder);

// Settings
router.get("/settings/global", isAuthenticated, getReminderSettings);
router.put("/settings/global", isAuthenticated, isSuperAdmin, updateReminderSettings);

// Processing endpoint (can be called by cron or manually)
router.post("/process/upcoming", isAuthenticated, isSuperAdmin, processUpcomingReminders);

export default router;

