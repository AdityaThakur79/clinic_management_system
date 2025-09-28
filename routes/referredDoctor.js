import express from "express";
import { createReferredDoctor, listReferredDoctors, updateReferredDoctor, deleteReferredDoctor, getReferredDoctorDetails, backfillReferredDoctorData, addCommissionPayment, listCommissionPayments, getReferredDoctorEarnings } from "../controllers/referredDoctor.js";
import { getReferredDoctorAppointments, addAppointmentCommission, getCommissionSummary } from "../controllers/appointmentCommission.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/", isAuthenticated, createReferredDoctor);
router.get("/", isAuthenticated, listReferredDoctors);
router.get("/:id", isAuthenticated, getReferredDoctorDetails);
router.put("/:id", isAuthenticated, updateReferredDoctor);
router.delete("/:id", isAuthenticated, deleteReferredDoctor);
router.post("/backfill", isAuthenticated, backfillReferredDoctorData);
router.post("/:id/payments", isAuthenticated, addCommissionPayment);
router.get("/:id/payments", isAuthenticated, listCommissionPayments);

// New commission management routes
router.get("/:id/earnings", isAuthenticated, getReferredDoctorEarnings);
router.get("/:id/appointments", isAuthenticated, getReferredDoctorAppointments);
router.get("/:id/commission-summary", isAuthenticated, getCommissionSummary);

export default router;

