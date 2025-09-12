import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isSuperAdmin } from "../middlewares/isSuperAdmin.js";
import upload from "../utils/common/Uploads.js";
import {
  createBranchAdmin,
  getAllBranchAdmins,
  getBranchAdminById,
  updateBranchAdmin,
  deleteBranchAdmin,
  getBranchAdminsByBranch,
} from "../controllers/branchAdmin.js";

const router = express.Router();

// Create BranchAdmin - Only SuperAdmin
router.post("/create", isAuthenticated, isSuperAdmin, upload, createBranchAdmin);

// Get All BranchAdmins (with search) - Authenticated users
router.post("/all", isAuthenticated, getAllBranchAdmins);

// Get BranchAdmin by ID - Authenticated users
router.post("/view", isAuthenticated, getBranchAdminById);

// Update BranchAdmin - Only SuperAdmin
router.put("/update", isAuthenticated, isSuperAdmin, upload, updateBranchAdmin);

// Delete BranchAdmin - Only SuperAdmin
router.delete("/delete", isAuthenticated, isSuperAdmin, deleteBranchAdmin);

// Get BranchAdmins by Branch - Authenticated users
router.post("/branch/all", isAuthenticated, getBranchAdminsByBranch);

export default router;
