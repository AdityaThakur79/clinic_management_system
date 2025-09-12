import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { isSuperAdmin } from "../middlewares/isSuperAdmin.js";
import upload from "../utils/common/Uploads.js";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorsByBranch,
  getDoctorsBySpecialization,
} from "../controllers/doctor.js";

const router = express.Router();

// Create Doctor - Only SuperAdmin
router.post("/create", isAuthenticated, upload, createDoctor);

// Get All Doctors (with search) - Authenticated users
router.post("/all", getAllDoctors);

// Get Doctor by ID - Authenticated users
router.post("/view", getDoctorById);

// Update Doctor - Only SuperAdmin
router.put("/update", isAuthenticated, upload, updateDoctor);

// Delete Doctor - Only SuperAdmin
router.delete("/delete", isAuthenticated, isSuperAdmin, deleteDoctor);

// Get Doctors by Branch - Authenticated users
router.post("/branch/all", isAuthenticated, getDoctorsByBranch);

// Get Doctors by Specialization - Authenticated users
router.post("/specialization/all", isAuthenticated, getDoctorsBySpecialization);

export default router;
