import express from "express";
import { globalSearch } from "../controllers/search.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Unified admin search endpoint
router.get("/", isAuthenticated, globalSearch);

export default router;


