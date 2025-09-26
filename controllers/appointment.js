import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import Branch from "../models/branch.js";
import { User as Doctor } from "../models/user.js";
import { sendEmail } from "../utils/common/sendMail.js";

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
    const { branchId, doctorId, date, timeSlot, notes, referredDoctorId, patient, patientId } = req.body;

    // Allow creating appointment without doctorId
    if (!branchId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    if (!patientId && !patient?.name) {
      return res.status(400).json({ success: false, message: "Missing patient information" });
    }

    // Validate branch (doctor validation only if provided)
    const branch = await Branch.findById(branchId).session(session);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });
    let doctor = null;
    if (doctorId) {
      doctor = await Doctor.findById(doctorId).session(session);
      if (!doctor || doctor.role !== "doctor") return res.status(404).json({ success: false, message: "Doctor not found" });
      if (doctor.branch?.toString() !== branchId) {
        return res.status(400).json({ success: false, message: "Doctor does not belong to this branch" });
      }
    }

    // Normalize date to specific day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);

    // Resolve patient: use provided patientId or find/create from inline data
    let patientDoc = null;
    if (patientId) {
      patientDoc = await Patient.findById(patientId).session(session);
      if (!patientDoc) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }
    } else {
      // Find or create patient by phone/email
      const patientQuery = [];
      if (patient?.contact) patientQuery.push({ contact: patient.contact });
      if (patient?.email) patientQuery.push({ email: patient.email.toLowerCase() });

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
    }

    // Create appointment (normalize timeSlot to HH:mm if a range was passed)
    const timeSlotNormalized = typeof timeSlot === 'string' && timeSlot.includes('-') ? timeSlot.split('-')[0] : timeSlot;
    let appointmentDoc;
    try {
      appointmentDoc = await Appointment.create([
        {
          patientId: patientDoc._id,
          doctorId: doctorId || undefined,
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
    // Send notifications in background (non-blocking)
    try {
      const [populatedAppointment, populatedDoctor, populatedBranch] = await Promise.all([
        Appointment.findById(appointmentDoc._id)
          .populate('patientId', 'name email contact')
          .populate('doctorId', 'name email')
          .populate('branchId', 'branchName address'),
        Doctor.findById(doctorId),
        Branch.findById(branchId),
      ]);

      // Email notifications
      (async () => {
        try {
          const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
          const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
          const patientEmail = populatedAppointment?.patientId?.email;
          const doctorEmail = populatedAppointment?.doctorId?.email || populatedDoctor?.email;
          const toSend = [
            { to: patientEmail, role: 'Patient' },
            { to: doctorEmail, role: 'Doctor' },
            { to: superAdminEmail, role: 'SuperAdmin' },
          ].filter(e => !!e.to);

          const subject = `Appointment Confirmed - ${populatedAppointment?.doctorId?.name} - ${formatDate(populatedAppointment?.date)} ${populatedAppointment?.timeSlot}`;
          const html = `
            <!doctype html>
            <html>
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width, initial-scale=1"/>
              <title>Appointment Confirmed</title>
              <style>
                body{margin:0;background:#f5fbff;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#0C2F4D}
                .container{max-width:640px;margin:0 auto;padding:24px}
                .card{background:#fff;border-radius:16px;box-shadow:0 10px 25px rgba(12,47,77,.08);overflow:hidden}
                .header{background:linear-gradient(135deg,#2BA8D1,#3AC0E7);color:#fff;padding:28px;text-align:center}
                .title{margin:0;font-size:22px}
                .sub{margin:6px 0 0 0;opacity:.95}
                .content{padding:24px}
                .row{display:flex;justify-content:space-between;gap:12px;margin:8px 0}
                .label{font-weight:600;color:#2BA8D1}
                .val{color:#0C2F4D}
                .cta{display:inline-block;margin-top:16px;background:#2BA8D1;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;box-shadow:0 6px 16px rgba(43,168,209,.35)}
                .footer{text-align:center;color:#42607a;font-size:12px;padding:18px}
                @media (max-width:480px){.row{flex-direction:column;align-items:flex-start}}
              </style>
            </head>
            <body>
              <div class="container">
                <div class="card">
                  <div class="header">
                    <h1 class="title">Appointment Confirmed</h1>
                    <p class="sub">Your visit has been scheduled successfully</p>
                  </div>
                  <div class="content">
                    <div class="row"><span class="label">Doctor</span><span class="val">${populatedAppointment?.doctorId?.name}</span></div>
                    <div class="row"><span class="label">Date</span><span class="val">${formatDate(populatedAppointment?.date)}</span></div>
                    <div class="row"><span class="label">Time</span><span class="val">${populatedAppointment?.timeSlot}</span></div>
                    <div class="row"><span class="label">Branch</span><span class="val">${populatedAppointment?.branchId?.branchName || populatedBranch?.branchName}</span></div>
                    <div class="row"><span class="label">Address</span><span class="val">${populatedAppointment?.branchId?.address || populatedBranch?.address}</span></div>
                    <a class="cta" href="https://maps.google.com/?q=${encodeURIComponent(populatedAppointment?.branchId?.address || populatedBranch?.address || '')}" target="_blank" rel="noreferrer">Open in Maps</a>
                  </div>
                  <div class="footer">
                    <div>Need help? Call <a href="tel:+917977483031" style="color:#2BA8D1;text-decoration:none">+91 79774 83031</a> or email <a href="mailto:aartiketspeechandhearing@gmail.com" style="color:#2BA8D1;text-decoration:none">aartiketspeechandhearing@gmail.com</a></div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `;

          await Promise.all(toSend.map(({ to }) => sendEmail({ to, subject, html })));
        } catch (e) {
          console.error('Appointment email notification failed:', e?.message || e);
        }
      })();

      // WhatsApp notification to patient via AiSensy (commented until API key is available)
      (async () => {
        try {
          const toPhone = populatedAppointment?.patientId?.contact;
          // NOTE: Enable below when AiSensy credentials are available.
          // Required env vars:
          //   AISENSY_API_KEY, AISENSY_CAMPAIGN_ID (or TEMPLATE), AISENSY_SENDER_ID (if applicable)
          // Docs: https://docs.aisensy.com/
          // Example payload (template-based):
          // if (process.env.AISENSY_API_KEY && toPhone) {
          //   const formatDate = (d) => new Date(d).toLocaleDateString('en-IN');
          //   const payload = {
          //     apiKey: process.env.AISENSY_API_KEY,
          //     campaignName: process.env.AISENSY_CAMPAIGN_ID, // or template/campaign identifier
          //     destination: `+91${String(toPhone).replace(/\D/g, '').slice(-10)}`,
          //     userName: populatedAppointment?.patientId?.name || 'Patient',
          //     templateParams: [
          //       populatedAppointment?.doctorId?.name,
          //       formatDate(populatedAppointment?.date),
          //       populatedAppointment?.timeSlot,
          //       populatedAppointment?.branchId?.branchName || '',
          //     ],
          //     source: 'api'
          //   };
          //   await fetch('https://backend.aisensy.com/apis/sendTemplateMessage', {
          //     method: 'POST',
          //     headers: { 'Content-Type': 'application/json' },
          //     body: JSON.stringify(payload)
          //   });
          // }
          console.log('AiSensy WhatsApp notification skipped (no API key configured).');
        } catch (e) {
          console.error('WhatsApp notification (AiSensy) failed:', e?.message || e);
        }
      })();
    } catch (notifyErr) {
      console.error('Notification scheduling failed:', notifyErr?.message || notifyErr);
    }

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
      .populate('patientId', 'name age gender contact email address plan')
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
      .populate('patientId', 'name age gender contact email plan')
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

export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Appointment ID is required" });
    }

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name age gender contact email address medicalHistory plan')
      .populate('doctorId', 'name email specialization')
      .populate('branchId', 'branchName address')
      .populate('referredDoctorId', 'name clinicName contact')
      .populate('billId')
      .populate('prescriptionId');

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    return res.json({
      success: true,
      appointment
    });
  } catch (error) {
    console.error("getAppointmentById error", error);
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
    ).populate('patientId', 'name age gender contact email plan')
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


