import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import Branch from "../models/branch.js";
import { User as Doctor } from "../models/user.js";

export const getAvailability = async (req, res) => {
  try {
    const { doctorId, branchId, date } = req.query;
    if (!doctorId || !branchId || !date) {
      return res.status(400).json({ success: false, message: "doctorId, branchId and date are required" });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const appointments = await Appointment.find({
      doctorId,
      branchId,
      date: { $gte: dayStart, $lt: dayEnd },
    }).select("timeSlot");

    // Normalize times to HH:mm to match frontend slots
    const normalizeTime = (t) => {
      if (!t || typeof t !== 'string') return t;
      const base = t.includes('-') ? t.split('-')[0] : t; // handle range "HH:mm-HH:mm"
      const [hStr = '', mStr = ''] = base.split(':');
      const hours = String(parseInt(hStr, 10)).padStart(2, '0');
      const minutes = String(parseInt(mStr, 10)).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const booked = new Set(appointments.map(a => normalizeTime(a.timeSlot)));
    return res.json({ success: true, bookedTimeSlots: Array.from(booked) });
  } catch (error) {
    console.error("getAvailability error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { branchId, doctorId, date, timeSlot, notes, referredDoctorId, patient } = req.body;

    if (!branchId || !doctorId || !date || !timeSlot || !patient?.name) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Validate branch and doctor
    const [branch, doctor] = await Promise.all([
      Branch.findById(branchId).session(session),
      Doctor.findById(doctorId).session(session),
    ]);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });
    if (!doctor || doctor.role !== "doctor") return res.status(404).json({ success: false, message: "Doctor not found" });
    if (doctor.branch?.toString() !== branchId) {
      return res.status(400).json({ success: false, message: "Doctor does not belong to this branch" });
    }

    // Normalize date to specific day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    // Find or create patient by phone/email
    const patientQuery = [];
    if (patient?.contact) patientQuery.push({ contact: patient.contact });
    if (patient?.email) patientQuery.push({ email: patient.email.toLowerCase() });

    let patientDoc = null;
    if (patientQuery.length > 0) {
      patientDoc = await Patient.findOne({ $or: patientQuery }).session(session);
    }
    if (!patientDoc) {
      patientDoc = await Patient.create([
        {
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          contact: patient.contact,
          email: patient.email,
          address: patient.address,
          medicalHistory: patient.medicalHistory || [],
        },
      ], { session });
      patientDoc = Array.isArray(patientDoc) ? patientDoc[0] : patientDoc;
    } else {
      // Optionally update basic fields
      patientDoc.name = patient.name || patientDoc.name;
      if (patient.age !== undefined) patientDoc.age = patient.age;
      if (patient.gender) patientDoc.gender = patient.gender;
      if (patient.address) patientDoc.address = patient.address;
      await patientDoc.save({ session });
    }

    // Create appointment (normalize timeSlot to HH:mm if a range was passed)
    const timeSlotNormalized = typeof timeSlot === 'string' && timeSlot.includes('-') ? timeSlot.split('-')[0] : timeSlot;
    let appointmentDoc;
    try {
      appointmentDoc = await Appointment.create([
        {
          patientId: patientDoc._id,
          doctorId,
          branchId,
          referredDoctorId: referredDoctorId || undefined,
          date: dayStart,
          timeSlot: timeSlotNormalized,
          notes,
        },
      ], { session });
      appointmentDoc = Array.isArray(appointmentDoc) ? appointmentDoc[0] : appointmentDoc;
    } catch (err) {
      if (err?.code === 11000) {
        await session.abortTransaction();
        return res.status(409).json({ success: false, message: "Selected time slot is no longer available" });
      }
      throw err;
    }

    // Link appointment to patient
    await Patient.updateOne(
      { _id: patientDoc._id },
      { $addToSet: { appointments: appointmentDoc._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ success: true, appointment: appointmentDoc, patient: patientDoc });
  } catch (error) {
    console.error("createAppointment error", error);
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      branchId, 
      doctorId, 
      status = '', 
      date,
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (branchId) filter.branchId = branchId;
    if (doctorId) filter.doctorId = doctorId;
    if (status) filter.status = status;
    
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      filter.date = { $gte: dayStart, $lt: dayEnd };
    }

    // Build search filter
    if (search) {
      filter.$or = [
        { 'patient.name': { $regex: search, $options: 'i' } },
        { 'patient.contact': { $regex: search, $options: 'i' } },
        { 'patient.email': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get appointments with populated data
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender contact email address')
      .populate('doctorId', 'name email specialization')
      .populate('branchId', 'branchName address')
      .populate('referredDoctorId', 'name clinicName contact')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Appointment.countDocuments(filter);

    return res.json({
      success: true,
      appointments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalAppointments: total,
        hasNext: skip + appointments.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("getAllAppointments error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTodayAppointments = async (req, res) => {
  try {
    const { branchId, doctorId } = req.query;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build filter for today's appointments
    const filter = {
      date: { $gte: today, $lt: tomorrow }
    };

    if (branchId) filter.branchId = branchId;
    if (doctorId) filter.doctorId = doctorId;

    // Get today's appointments
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name age gender contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('referredDoctorId', 'name clinicName')
      .sort({ timeSlot: 1 });

    // Group by status
    const grouped = {
      booked: appointments.filter(apt => apt.status === 'booked'),
      completed: appointments.filter(apt => apt.status === 'completed'),
      cancelled: appointments.filter(apt => apt.status === 'cancelled')
    };

    return res.json({
      success: true,
      appointments,
      grouped,
      total: appointments.length,
      date: today.toISOString().split('T')[0]
    });
  } catch (error) {
    console.error("getTodayAppointments error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ success: false, message: "Appointment ID and status are required" });
    }

    const validStatuses = ['booked', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status. Must be one of: booked, completed, cancelled" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('patientId', 'name age gender contact email')
     .populate('doctorId', 'name specialization')
     .populate('branchId', 'branchName address')
     .populate('referredDoctorId', 'name clinicName');

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    return res.json({
      success: true,
      appointment,
      message: "Appointment status updated successfully"
    });
  } catch (error) {
    console.error("updateAppointmentStatus error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Remove appointment from patient's appointments array
    await Patient.findByIdAndUpdate(
      appointment.patientId,
      { $pull: { appointments: appointment._id } }
    );

    // Delete the appointment
    await Appointment.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    console.error("deleteAppointment error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


