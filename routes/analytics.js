import express from "express";
import { getOverview } from "../controllers/analytics.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Overview analytics with optional filters: branchId, doctorId, from, to
router.get("/overview", isAuthenticated, getOverview);

export default router;



