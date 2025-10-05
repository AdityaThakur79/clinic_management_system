import express from "express";
import { getOverview, sendTodaysBirthdayWishes } from "../controllers/analytics.js";
import { getBirthdaysToday } from "../controllers/birthdays.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Overview analytics with optional filters: branchId, doctorId, from, to
router.get("/overview", isAuthenticated, getOverview);
router.get("/birthdays/today", isAuthenticated, getBirthdaysToday);
router.post("/birthdays/send-today", isAuthenticated, sendTodaysBirthdayWishes);

export default router;

