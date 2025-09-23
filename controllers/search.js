import mongoose from "mongoose";
import Patient from "../models/patient.js";
import Appointment from "../models/appointment.js";
import Bill from "../models/bill.js";
import Branch from "../models/branch.js";
import { User } from "../models/user.js";
import { Service } from "../models/services.js";
import Inventory from "../models/inventory.js";

// Unified admin search across core collections
// GET /api/search?q=...&limit=10&types=patients,appointments,bills,branches,branchAdmins,doctors,services,inventory
export const globalSearch = async (req, res) => {
  try {
    const { q = "", limit = 10, types } = req.query || {};
    const trimmed = String(q).trim();
    if (!trimmed) {
      return res.status(400).json({ success: false, message: "Query 'q' is required" });
    }
    const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const typeList = typeof types === "string" && types.length > 0
      ? types.split(",").map(t => t.trim().toLowerCase())
      : [
          "patients",
          "appointments",
          "bills",
          "branches",
          "branchadmins",
          "doctors",
          "services",
          "inventory",
        ];

    // Role-based scope: branch admins and doctors are limited to their branch
    const role = req.user?.role;
    const scopeBranchId = (role === "branchAdmin" || role === "doctor")
      ? (req.user?.branch?._id || req.user?.branch)
      : undefined;

    const branchFilter = scopeBranchId ? { branchId: new mongoose.Types.ObjectId(scopeBranchId) } : {};

    const tasks = [];

    if (typeList.includes("patients")) {
      tasks.push(
        Patient.find({
          ...(scopeBranchId ? { branchId: branchFilter.branchId } : {}),
          $or: [
            { name: regex },
            { email: regex },
            { contact: regex },
            { address: regex },
          ],
        })
          .limit(parseInt(limit))
          .select("name email contact address branchId")
          .populate("branchId", "branchName")
          .then((items) => ({ key: "patients", items }))
      );
    }

    if (typeList.includes("appointments")) {
      tasks.push(
        Appointment.find({
          ...(scopeBranchId ? { branchId: branchFilter.branchId } : {}),
          $or: [
            { status: regex },
          ],
        })
          .limit(parseInt(limit))
          .select("date timeSlot status patientId doctorId branchId billId")
          .populate("patientId", "name contact")
          .populate("doctorId", "name specialization")
          .populate("branchId", "branchName")
          .then((items) => ({ key: "appointments", items }))
      );
    }

    if (typeList.includes("bills")) {
      tasks.push(
        Bill.find({
          ...(scopeBranchId ? { branchId: branchFilter.branchId } : {}),
          $or: [
            { billNumber: regex },
            { paymentMethod: regex },
            { paymentStatus: regex },
          ],
        })
          .limit(parseInt(limit))
          .select("billNumber totalAmount paymentStatus paymentMethod patientId doctorId branchId appointmentId")
          .populate("patientId", "name contact")
          .populate("doctorId", "name")
          .populate("branchId", "branchName")
          .then((items) => ({ key: "bills", items }))
      );
    }

    if (typeList.includes("branches")) {
      tasks.push(
        Branch.find({ $or: [{ branchName: regex }, { address: regex }] })
          .limit(parseInt(limit))
          .select("branchName address")
          .then((items) => ({ key: "branches", items }))
      );
    }

    if (typeList.includes("branchadmins")) {
      tasks.push(
        User.find({
          role: "branchAdmin",
          ...(scopeBranchId ? { branch: new mongoose.Types.ObjectId(scopeBranchId) } : {}),
          $or: [{ name: regex }, { email: regex }],
        })
          .limit(parseInt(limit))
          .select("name email branch role")
          .then((items) => ({ key: "branchAdmins", items }))
      );
    }

    if (typeList.includes("doctors")) {
      tasks.push(
        User.find({
          role: "doctor",
          ...(scopeBranchId ? { branch: new mongoose.Types.ObjectId(scopeBranchId) } : {}),
          $or: [{ name: regex }, { email: regex }, { specialization: regex }],
        })
          .limit(parseInt(limit))
          .select("name email specialization branch role")
          .then((items) => ({ key: "doctors", items }))
      );
    }

    if (typeList.includes("services")) {
      tasks.push(
        Service.find({ $or: [{ name: regex }, { description: regex }] })
          .limit(parseInt(limit))
          .select("name description isActive")
          .then((items) => ({ key: "services", items }))
      );
    }

    if (typeList.includes("inventory")) {
      tasks.push(
        Inventory.find({
          ...(scopeBranchId ? { branchId: branchFilter.branchId } : {}),
          $or: [{ name: regex }, { deviceName: regex }, { category: regex }, { sku: regex }],
        })
          .limit(parseInt(limit))
          .select("name deviceName category sku quantity branchId")
          .populate("branchId", "branchName")
          .then((items) => ({ key: "inventory", items }))
      );
    }

    const results = await Promise.all(tasks);
    const response = results.reduce((acc, r) => {
      acc[r.key] = r.items;
      return acc;
    }, {});

    return res.status(200).json({ success: true, query: trimmed, results: response });
  } catch (error) {
    console.error("Global search error", error);
    return res.status(500).json({ success: false, message: "Search failed", error: error.message });
  }
};


