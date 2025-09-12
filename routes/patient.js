import express from "express";
import { getAllPatients, createPatient, getPatientById, updatePatient, deletePatient } from "../controllers/patient.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// All routes are protected
router.get("/", isAuthenticated, getAllPatients);
router.post("/", isAuthenticated, createPatient);
router.get("/:id", isAuthenticated, getPatientById);
router.put("/:id", isAuthenticated, updatePatient);
router.delete("/:id", isAuthenticated, deletePatient);

export default router;
