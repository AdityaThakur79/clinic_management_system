import express from "express";
import { 
  getAllPatients, 
  createPatient, 
  getPatientById, 
  updatePatient, 
  deletePatient,
  getPatientDetails,
  completeAppointment,
  updateCompletedAppointment,
  getReferredDoctorDetails,
  getAllReferredDoctors
} from "../controllers/patient.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// All routes are protected
router.get("/", isAuthenticated, getAllPatients);
router.post("/", isAuthenticated, createPatient);
router.get("/:id", isAuthenticated, getPatientById);
router.get("/:id/details", isAuthenticated, getPatientDetails);
router.put("/:id", isAuthenticated, updatePatient);
router.delete("/:id", isAuthenticated, deletePatient);

// Appointment completion (for doctors)
router.post("/appointments/:appointmentId/complete", isAuthenticated, completeAppointment);
router.put("/appointments/:appointmentId/update-completed", isAuthenticated, updateCompletedAppointment);

// Referred doctor routes
router.get("/referred-doctors", isAuthenticated, getAllReferredDoctors);
router.get("/referred-doctors/:id", isAuthenticated, getReferredDoctorDetails);

export default router;
