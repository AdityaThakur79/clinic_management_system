import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import Branch from "../models/branch.js";
import { User as Doctor } from "../models/user.js";
import { Service } from "../models/services.js";
import { sendEmail } from "../utils/common/sendMail.js";

export const getAvailability = async (req, res) => {
  try {
    const { branchId, date } = req.query;
    if (!branchId || !date) {
      return res.status(400).json({ success: false, message: "branchId and date are required" });
    }

    // Get branch details to check working days and hours
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ success: false, message: "Branch not found" });
    }

    const requestedDate = new Date(date);
    const dayName = requestedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Check if branch is open on this day using flexible working hours
    const dayWorkingHours = branch.dailyWorkingHours?.[dayName];
    const isWorkingDay = dayWorkingHours?.isWorking || branch.workingDays?.includes(dayName);
    
    if (!isWorkingDay) {
      return res.json({ 
        success: true, 
        availableSlots: [],
        bookedTimeSlots: [],
        message: `Branch is closed on ${dayName}` 
      });
    }

    const dayStart = new Date(requestedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    // Get all appointments for this branch and date
    const appointments = await Appointment.find({
      branchId,
      date: { $gte: dayStart, $lt: dayEnd },
    }).select("timeSlot");

    // Generate available slots based on branch working hours
    const availableSlots = generateBranchSlots(branch, requestedDate);
    
    // Get booked slots
    const normalizeTime = (t) => {
      if (!t || typeof t !== 'string') return t;
      const base = t.includes('-') ? t.split('-')[0] : t;
      const [hStr = '', mStr = ''] = base.split(':');
      const hours = String(parseInt(hStr, 10)).padStart(2, '0');
      const minutes = String(parseInt(mStr, 10)).padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    const bookedSlots = new Set(appointments.map(a => normalizeTime(a.timeSlot)));
    
    // Mark slots as booked or available
    const slotsWithStatus = availableSlots.map(slot => ({
      time: slot,
      isAvailable: !bookedSlots.has(slot),
      isBooked: bookedSlots.has(slot)
    }));

    return res.json({ 
      success: true, 
      availableSlots: slotsWithStatus,
      bookedTimeSlots: Array.from(bookedSlots),
      branchWorkingHours: {
        start: branch.workingHours.start,
        end: branch.workingHours.end,
        slotDuration: branch.slotDuration
      }
    });
  } catch (error) {
    console.error("getAvailability error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper function to generate slots based on branch working hours
const generateBranchSlots = (branch, date) => {
  const slots = [];
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Use flexible daily working hours if available, otherwise fall back to legacy working hours
  const dayWorkingHours = branch.dailyWorkingHours?.[dayName];
  let start, end;
  
  if (dayWorkingHours && dayWorkingHours.isWorking) {
    start = dayWorkingHours.start;
    end = dayWorkingHours.end;
  } else {
    // Fall back to legacy working hours
    start = branch.workingHours?.start || '09:00';
    end = branch.workingHours?.end || '17:00';
  }
  
  const slotDuration = branch.slotDuration || 30;
  
  // Parse working hours
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);
  
  const startTime = new Date(date);
  startTime.setHours(startHour, startMin, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMin, 0, 0);
  
  // If it's today, start from current time + slot duration
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    const now = new Date();
    const nextAvailableTime = new Date(now);
    nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + slotDuration);
    
    // Round up to the next slot interval
    const minutesToAdd = slotDuration - (nextAvailableTime.getMinutes() % slotDuration);
    nextAvailableTime.setMinutes(nextAvailableTime.getMinutes() + minutesToAdd);
    
    if (nextAvailableTime > startTime) {
      startTime.setTime(nextAvailableTime.getTime());
    }
  }
  
  // Generate slots
  const currentSlot = new Date(startTime);
  while (currentSlot < endTime) {
    // Check if this slot conflicts with break times
    const isInBreak = branch.breakTimes?.some(breakTime => {
      const [breakStartHour, breakStartMin] = breakTime.start.split(':').map(Number);
      const [breakEndHour, breakEndMin] = breakTime.end.split(':').map(Number);
      
      const breakStart = new Date(date);
      breakStart.setHours(breakStartHour, breakStartMin, 0, 0);
      
      const breakEnd = new Date(date);
      breakEnd.setHours(breakEndHour, breakEndMin, 0, 0);
      
      return currentSlot >= breakStart && currentSlot < breakEnd;
    });
    
    if (!isInBreak) {
      const hours = String(currentSlot.getHours()).padStart(2, '0');
      const minutes = String(currentSlot.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
    }
    
    // Move to next slot
    currentSlot.setMinutes(currentSlot.getMinutes() + slotDuration);
  }
  
  return slots;
};

export const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { branchId, service, date, timeSlot, notes, referredDoctorId, patient, patientId, servicePrice, serviceDuration } = req.body;

    // Validate required fields
    if (!branchId || !service || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: "Missing required fields: branchId, service, date, timeSlot" });
    }
    if (!patientId && !patient?.name) {
      return res.status(400).json({ success: false, message: "Missing patient information" });
    }

    // Validate branch
    const branch = await Branch.findById(branchId).session(session);
    if (!branch) return res.status(404).json({ success: false, message: "Branch not found" });

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
          service,
          branchId,
          referredDoctorId: referredDoctorId || undefined,
          date: dayStart,
          timeSlot: timeSlotNormalized,
          notes,
          charges: servicePrice || 0,
          duration: serviceDuration || 30, // Default 30 minutes
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
      const [populatedAppointment, populatedBranch] = await Promise.all([
        Appointment.findById(appointmentDoc._id)
          .populate('patientId', 'name email contact')
          .populate('branchId', 'branchName address'),
        Branch.findById(branchId),
      ]);

      // Email notifications
      (async () => {
        try {
          const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
          const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
          const patientEmail = populatedAppointment?.patientId?.email;
          const toSend = [
            { to: patientEmail, role: 'Patient' },
            { to: superAdminEmail, role: 'SuperAdmin' },
          ].filter(e => !!e.to);

          const subject = `Appointment Confirmed - ${populatedAppointment?.service} - ${formatDate(populatedAppointment?.date)} ${populatedAppointment?.timeSlot}`;
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
                    <div class="row"><span class="label">Service</span><span class="val">${populatedAppointment?.service}</span></div>
                    <div class="row"><span class="label">Date</span><span class="val">${formatDate(populatedAppointment?.date)}</span></div>
                    <div class="row"><span class="label">Time</span><span class="val">${populatedAppointment?.timeSlot}</span></div>
                    <div class="row"><span class="label">Branch</span><span class="val">${populatedAppointment?.branchId?.branchName || populatedBranch?.branchName}</span></div>
                    <div class="row"><span class="label">Address</span><span class="val">${populatedAppointment?.branchId?.address || populatedBranch?.address}</span></div>
                    <div class="row"><span class="label">Charges</span><span class="val">₹${populatedAppointment?.charges || 'TBD'}</span></div>
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
          //       populatedAppointment?.service,
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

    return res.status(201).json({ 
      success: true, 
      appointment: appointmentDoc, 
      patient: patientDoc,
      service: service,
      message: "Appointment booked successfully. A doctor will be assigned to your appointment."
    });
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

export const assignDoctorToAppointment = async (req, res) => {
  try {
    const { appointmentId, doctorId } = req.body;

    if (!appointmentId || !doctorId) {
      return res.status(400).json({ success: false, message: "Appointment ID and Doctor ID are required" });
    }

    // Validate appointment exists and is not already assigned
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.doctorId) {
      return res.status(400).json({ success: false, message: "Appointment is already assigned to a doctor" });
    }

    // Validate doctor exists and belongs to the same branch
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.branch?.toString() !== appointment.branchId.toString()) {
      return res.status(400).json({ success: false, message: "Doctor does not belong to this branch" });
    }

    // Assign doctor to appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        doctorId,
        status: 'assigned',
        assignedAt: new Date(),
        assignedBy: req.user?.id
      },
      { new: true }
    ).populate('patientId', 'name email contact')
     .populate('doctorId', 'name email specialization')
     .populate('branchId', 'branchName address');

    return res.json({
      success: true,
      appointment: updatedAppointment,
      message: "Doctor assigned to appointment successfully"
    });
  } catch (error) {
    console.error("assignDoctorToAppointment error", error);
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


