import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import Branch from "../models/branch.js";
import { User as Doctor } from "../models/user.js";
import { Service } from "../models/services.js";
import { sendEmail } from "../utils/common/sendMail.js";
import { sendAppointmentNotifications } from "../utils/services/notifications.js";
import { sendReferralDoctorWhatsapp } from "../utils/services/notifications.js";

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

    // Parse YYYY-MM-DD as local date to avoid UTC shift issues
    const parseDateOnly = (ds) => {
      if (typeof ds === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ds)) {
        const [y, m, d] = ds.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(ds);
    };

    const requestedDate = parseDateOnly(date);
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

export const getMultipleDateAvailability = async (req, res) => {
  try {
    const { branchId, startDate, days = 7 } = req.query;
    
    if (!branchId || !startDate) {
      return res.status(400).json({ 
        success: false, 
        message: "branchId and startDate are required" 
      });
    }

    // Get branch details
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ 
        success: false, 
        message: "Branch not found" 
      });
    }

    // Parse startDate as local date
    const parseDateOnly = (ds) => {
      if (typeof ds === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(ds)) {
        const [y, m, d] = ds.split('-').map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date(ds);
    };
    const start = parseDateOnly(startDate);
    const results = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Check if branch is open on this day
      const dayWorkingHours = branch.dailyWorkingHours?.[dayName];
      const isWorkingDay = dayWorkingHours?.isWorking || branch.workingDays?.includes(dayName);
      
      if (!isWorkingDay) {
        results.push({
          date: `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`,
          availableSlots: [],
          bookedTimeSlots: [],
          isWorkingDay: false,
          message: `Branch is closed on ${dayName}`
        });
        continue;
      }

      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      // Get all appointments for this branch and date
      const appointments = await Appointment.find({
        branchId,
        date: { $gte: dayStart, $lt: dayEnd },
      }).select("timeSlot");

      // Generate available slots based on branch working hours
      const availableSlots = generateBranchSlots(branch, currentDate);
      
      // Get booked slots
      const normalizeTime = (t) => {
        if (!t || typeof t !== 'string') return t;
        const base = t.includes('-') ? t.split('-')[0] : t;
        const [hStr = '', mStr = ''] = base.split(':');
        const hours = String(parseInt(hStr, 10)).padStart(2, '0');
        const minutes = String(parseInt(mStr, 10)).padStart(2, '0');
        return `${hours}:${minutes}`;
      };

      const bookedTimeSlots = appointments.map(apt => normalizeTime(apt.timeSlot));
      const bookedSlotsSet = new Set(bookedTimeSlots);
      
      // Show ALL slots (both available and booked) with their status
      const finalAvailableSlots = availableSlots.map(slot => ({
        time: slot,
        isAvailable: !bookedSlotsSet.has(normalizeTime(slot)),
        isBooked: bookedSlotsSet.has(normalizeTime(slot))
      }));

      results.push({
        date: `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(currentDate.getDate()).padStart(2,'0')}`,
        availableSlots: finalAvailableSlots,
        bookedTimeSlots,
        isWorkingDay: true
      });
    }

    return res.json({
      success: true,
      data: results,
      branchId,
      startDate,
      days: parseInt(days)
    });

  } catch (error) {
    console.error("Error getting multiple date availability:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export const createAppointment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { branchId, service, date, timeSlot, notes, referredDoctorId, patient, patientId, servicePrice, serviceDuration, serviceDetails } = req.body;

    // Validate required fields (service is optional)
    const missing = [];
    if (!branchId) missing.push('branchId');
    if (!date) missing.push('date');
    if (!patientId && !patient?.name) missing.push('patientId or patient.name');
    if (missing.length) {
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` });
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

    // Create appointment (normalize timeSlot to HH:mm if a range was passed, or set default for consultation requests)
    const timeSlotNormalized = !timeSlot ? "09:00" : 
                              (timeSlot === "Any" ? "09:00" : 
                              (typeof timeSlot === 'string' && timeSlot.includes('-') ? timeSlot.split('-')[0] : timeSlot));
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

    // Send notifications in background (non-blocking) after successful appointment creation
    (async () => {
      console.log('[APPOINTMENT] Starting notification process...', {
        appointmentId: appointmentDoc._id,
        branchId,
        service,
        timestamp: new Date().toISOString()
      });
      
      try {
        console.log('[APPOINTMENT] Fetching populated appointment and branch data...');
        const [populatedAppointment, populatedBranch] = await Promise.all([
          Appointment.findById(appointmentDoc._id)
            .populate('patientId', 'name email contact')
            .populate('branchId', 'branchName address'),
          Branch.findById(branchId),
        ]);
        
        console.log('[APPOINTMENT] Data fetched successfully:', {
          appointment: {
            id: populatedAppointment?._id,
            patientEmail: populatedAppointment?.patientId?.email,
            patientName: populatedAppointment?.patientId?.name,
            patientContact: populatedAppointment?.patientId?.contact,
            service: populatedAppointment?.service,
            date: populatedAppointment?.date,
            timeSlot: populatedAppointment?.timeSlot
          },
          branch: {
            id: populatedBranch?._id,
            name: populatedBranch?.branchName,
            address: populatedBranch?.address
          }
        });

        // Check environment variables for email configuration
        console.log('[APPOINTMENT] Email configuration check:', {
          smtpUser: process.env.SMTP_USER ? '***provided***' : '***missing***',
          smtpPass: process.env.SMTP_PASS ? '***provided***' : '***missing***',
          emailUser: process.env.EMAIL_USER ? '***provided***' : '***missing***',
          emailPass: process.env.EMAIL_PASS ? '***provided***' : '***missing***',
          smtpHost: process.env.SMTP_HOST || 'not set (using Gmail)',
          smtpPort: process.env.SMTP_PORT || 'not set (using default)',
          smtpSecure: process.env.SMTP_SECURE || 'not set (using default)',
          superAdminEmail: process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL || 'not set',
          emailHeaderImageUrl: process.env.EMAIL_HEADER_IMAGE_URL || 'not set',
          whatsappMediaUrl: process.env.WHATSAPP_MEDIA_URL || 'not set'
        });

        console.log('[APPOINTMENT] Calling sendAppointmentNotifications...');
        // Pass through optional serviceDetails and media image (if provided by client)
        await sendAppointmentNotifications({ 
          appointment: populatedAppointment, 
          branch: populatedBranch, 
          serviceName: service, 
          serviceDetails: serviceDetails || null, 
          mediaUrl: process.env.EMAIL_HEADER_IMAGE_URL || process.env.WHATSAPP_MEDIA_URL || null 
        });
        
        console.log('[APPOINTMENT] Notifications sent successfully!');
      } catch (notifyErr) {
        console.error('[APPOINTMENT] Notification error details:', {
          error: notifyErr?.message || notifyErr,
          stack: notifyErr?.stack,
          code: notifyErr?.code,
          response: notifyErr?.response,
          timestamp: new Date().toISOString()
        });
      }
    })();

    return res.status(201).json({ 
      success: true, 
      appointment: appointmentDoc, 
      patient: patientDoc,
      service: service,
      message: "Appointment booked successfully. A doctor will be assigned to your appointment."
    });
  } catch (error) {

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

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTodayAppointments = async (req, res) => {
  try {
    const { branchId, doctorId } = req.query;

    // Get today's date range - use local date to match appointment creation
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);


    // Build filter for today's appointments
    const filter = {
      date: { $gte: todayStart, $lt: tomorrowStart }
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

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAppointmentTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { timeSlot, date } = req.body;

    if (!id || !timeSlot) {
      return res.status(400).json({ success: false, message: "Appointment ID and timeSlot are required" });
    }

    // Find the appointment
    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name email contact')
      .populate('branchId', 'branchName address');

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Update the appointment with new timeSlot and optionally date
    const updateData = { timeSlot };
    if (date) {
      updateData.date = new Date(date);
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('patientId', 'name email contact')
     .populate('branchId', 'branchName address');

    // Send notification emails/WhatsApp since timeSlot was updated
    (async () => {
      try {
        const superAdminEmail = process.env.SUPERADMIN_EMAIL || process.env.ADMIN_EMAIL;
        const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          weekday: 'long'
        });

        // Email to patient
        if (updatedAppointment.patientId?.email) {
          await sendEmail({
            to: updatedAppointment.patientId.email,
            subject: `Appointment Confirmed - ${updatedAppointment.service}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2B5A8A;">Appointment Confirmed!</h2>
                <p>Dear ${updatedAppointment.patientId.name},</p>
                <p>Your appointment has been confirmed with the following details:</p>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #2B5A8A; margin-top: 0;">Appointment Details</h3>
                  <p><strong>Service:</strong> ${updatedAppointment.service}</p>
                  <p><strong>Date:</strong> ${formatDate(updatedAppointment.date)}</p>
                  <p><strong>Time:</strong> ${updatedAppointment.timeSlot}</p>
                  <p><strong>Branch:</strong> ${updatedAppointment.branchId?.branchName}</p>
                  <p><strong>Address:</strong> ${updatedAppointment.branchId?.address}</p>
                </div>
                <p>Please arrive 10 minutes before your scheduled time.</p>
                <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
                <p>Best regards,<br>Your Healthcare Team</p>
              </div>
            `
          });
        }

        // Email to admin
        if (superAdminEmail) {
          await sendEmail({
            to: superAdminEmail,
            subject: `New Appointment Confirmed - ${updatedAppointment.service}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2B5A8A;">Appointment Confirmed</h2>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #2B5A8A; margin-top: 0;">Appointment Details</h3>
                  <p><strong>Patient:</strong> ${updatedAppointment.patientId?.name}</p>
                  <p><strong>Contact:</strong> ${updatedAppointment.patientId?.contact}</p>
                  <p><strong>Email:</strong> ${updatedAppointment.patientId?.email}</p>
                  <p><strong>Service:</strong> ${updatedAppointment.service}</p>
                  <p><strong>Date:</strong> ${formatDate(updatedAppointment.date)}</p>
                  <p><strong>Time:</strong> ${updatedAppointment.timeSlot}</p>
                  <p><strong>Branch:</strong> ${updatedAppointment.branchId?.branchName}</p>
                  <p><strong>Notes:</strong> ${updatedAppointment.notes || 'No additional notes'}</p>
                </div>
              </div>
            `
          });
        }

        // WhatsApp notification (if enabled)
        if (process.env.WHATSAPP_ENABLED === 'true' && updatedAppointment.patientId?.contact) {
          const whatsappMessage = `Appointment Confirmed!\n\nService: ${updatedAppointment.service}\nDate: ${formatDate(updatedAppointment.date)}\nTime: ${updatedAppointment.timeSlot}\nBranch: ${updatedAppointment.branchId?.branchName}\n\nPlease arrive 10 minutes before your scheduled time.`;
          
          // Add WhatsApp API call here if you have WhatsApp integration
          console.log('WhatsApp notification would be sent:', {
            to: updatedAppointment.patientId.contact,
            message: whatsappMessage
          });
        }

      } catch (emailError) {
        console.error('Error sending appointment confirmation emails:', emailError);
      }
    })();

    res.status(200).json({
      success: true,
      message: "Appointment timeSlot updated successfully and notifications sent",
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Error updating appointment timeSlot:', error);
    res.status(500).json({ success: false, message: "Server error" });
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

    // If completed and has referred doctor, send thank-you WhatsApp
    try {
      if (status === 'completed' && appointment?.referredDoctorId?.contact) {
        const doctorPhone = appointment.referredDoctorId.contact;
        const doctorName = appointment.referredDoctorId.name;
        const patientName = appointment.patientId?.name;
        const dateStr = appointment.date ? new Date(appointment.date).toLocaleDateString('en-IN') : '';
        await sendReferralDoctorWhatsapp({ doctorPhone, doctorName, patientName, date: dateStr });
      }
    } catch (_) {}

    return res.json({
      success: true,
      appointment,
      message: "Appointment status updated successfully"
    });
  } catch (error) {

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

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

