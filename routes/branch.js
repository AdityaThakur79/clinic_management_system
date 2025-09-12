import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createBranchController,
  getAllBranchesController,
  getBranchByIdController,
  updateBranchController,
  deleteBranchController,
} from "../controllers/branch.js";

const router = express.Router();

// ✅ Create Branch
router.post("/create", isAuthenticated, createBranchController);

// ✅ Get All Branches
router.get("/all", getAllBranchesController);

// ✅ Get Single Branch
router.post("/view", isAuthenticated, getBranchByIdController);

// ✅ Update Branch
router.put("/update", isAuthenticated, updateBranchController);

// ✅ Delete Branch
router.delete("/delete", isAuthenticated, deleteBranchController);

export default router;
