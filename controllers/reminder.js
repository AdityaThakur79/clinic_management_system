import { Reminder, ReminderSettings } from "../models/reminder.js";
import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import { User } from "../models/user.js";
import Branch from "../models/branch.js";
import { sendEmail } from "../utils/common/sendMail.js";

// Get all reminders with filters
export const getAllReminders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      type = '',
      status = '',
      priority = '',
      startDate = '',
      endDate = '',
      branchId = '',
      doctorId = '',
      appointmentId = ''
    } = req.query;

    const userRole = req.user?.role;
    const userBranchId = req.user?.branch?._id || req.user?.branch;

    // Build filter based on user role
    let filter = {};
    if (userRole === 'branchAdmin' || userRole === 'doctor') {
      filter.branchId = userBranchId;
      if (userRole === 'doctor') {
        filter.doctorId = req.user.userId;
      }
    } else if (branchId) {
      filter.branchId = branchId;
    }
    if (doctorId) {
      filter.doctorId = doctorId;
    }
    if (appointmentId) filter.appointmentId = appointmentId;

    // Add search filters
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) filter.type = type;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    // Date range filter
    if (startDate || endDate) {
      filter.reminderDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.reminderDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.reminderDate.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reminders = await Reminder.find(filter)
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name')
      .sort({ reminderDate: 1, reminderTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reminder.countDocuments(filter);

    return res.json({
      success: true,
      reminders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReminders: total,
        hasNext: skip + reminders.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("getAllReminders error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get today's reminders
export const getTodayReminders = async (req, res) => {
  try {
    const { branchId, doctorId } = req.query;
    const userRole = req.user?.role;
    const userBranchId = req.user?.branch?._id || req.user?.branch;

    // Build filter based on user role
    let filter = {};
    if (userRole === 'branchAdmin' || userRole === 'doctor') {
      filter.branchId = userBranchId;
      if (userRole === 'doctor') {
        filter.doctorId = req.user.userId;
      }
    } else if (branchId) {
      filter.branchId = branchId;
    }
    if (doctorId) {
      filter.doctorId = doctorId;
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filter.reminderDate = { $gte: today, $lt: tomorrow };
    filter.status = { $in: ['pending', 'sent'] };

    const reminders = await Reminder.find(filter)
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .sort({ reminderTime: 1 });

    return res.json({ success: true, reminders });
  } catch (error) {
    console.error("getTodayReminders error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get reminders by date range (for calendar view)
export const getRemindersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate, branchId, doctorId } = req.query;
    const userRole = req.user?.role;
    const userBranchId = req.user?.branch?._id || req.user?.branch;

    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: "Start date and end date are required" });
    }

    // Build filter based on user role
    let filter = {};
    if (userRole === 'branchAdmin' || userRole === 'doctor') {
      filter.branchId = userBranchId;
      if (userRole === 'doctor') {
        filter.doctorId = req.user.userId;
      }
    } else if (branchId) {
      filter.branchId = branchId;
    }
    if (doctorId) {
      filter.doctorId = doctorId;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    filter.reminderDate = { $gte: start, $lte: end };

    const reminders = await Reminder.find(filter)
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .sort({ reminderDate: 1, reminderTime: 1 });

    return res.json({ success: true, reminders });
  } catch (error) {
    console.error("getRemindersByDateRange error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get reminder by ID
export const getReminderById = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findById(id)
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email age gender address')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address contact')
      .populate('createdBy', 'name');

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    return res.json({ success: true, reminder });
  } catch (error) {
    console.error("getReminderById error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create reminder
export const createReminder = async (req, res) => {
  try {
    const {
      appointmentId,
      patientId,
      doctorId,
      branchId,
      type,
      title,
      description,
      reminderDate,
      reminderTime,
      priority = 'medium',
      method = 'in_app',
      isRecurring = false,
      recurringPattern,
      recurringEndDate,
      notes = ''
    } = req.body;

    // Allow general reminders without appointment/patient when created manually
    const hasCore = !!(type && title && description && reminderDate && reminderTime);
    const hasContext = !!(appointmentId && patientId) || !!(doctorId || req.user?.userId) && !!(branchId || req.user?.branch);
    if (!hasCore || !hasContext) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const reminder = new Reminder({
      appointmentId: appointmentId || null,
      patientId: patientId || null,
      doctorId: doctorId || req.user.userId,
      branchId: branchId || req.user?.branch?._id || req.user?.branch,
      type,
      title,
      description,
      reminderDate: new Date(reminderDate),
      reminderTime,
      priority,
      method,
      isRecurring,
      recurringPattern: isRecurring ? recurringPattern : null,
      recurringEndDate: isRecurring ? new Date(recurringEndDate) : null,
      notes,
      createdBy: req.user.userId
    });

    await reminder.save();

    const populatedReminder = await Reminder.findById(reminder._id)
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name');

    return res.status(201).json({ success: true, reminder: populatedReminder });
  } catch (error) {
    console.error("createReminder error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update reminder
export const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert date strings to Date objects if present
    if (updateData.reminderDate) {
      updateData.reminderDate = new Date(updateData.reminderDate);
    }
    if (updateData.recurringEndDate) {
      updateData.recurringEndDate = new Date(updateData.recurringEndDate);
    }

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name');

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    return res.json({ success: true, reminder });
  } catch (error) {
    console.error("updateReminder error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update reminder status
export const updateReminderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const validStatuses = ['pending', 'sent', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updateData = { status };
    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name');

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    return res.json({ success: true, reminder });
  } catch (error) {
    console.error("updateReminderStatus error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark reminder as completed
export const markReminderCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    )
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name');

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    return res.json({ success: true, reminder });
  } catch (error) {
    console.error("markReminderCompleted error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete reminder
export const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findByIdAndDelete(id);

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    return res.json({ success: true, message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("deleteReminder error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Send reminder manually
export const sendReminder = async (req, res) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { 
        status: 'completed',
        sentAt: new Date(),
        completedAt: new Date()
      },
      { new: true }
    )
      .populate('appointmentId', 'date timeSlot status')
      .populate('patientId', 'name contact email')
      .populate('doctorId', 'name specialization')
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name');

    if (!reminder) {
      return res.status(404).json({ success: false, message: "Reminder not found" });
    }

    // Send Email
    try {
      const apptDate = reminder.appointmentId?.date;
      const apptTime = reminder.appointmentId?.timeSlot;
      const subject = `Appointment Reminder - ${reminder.doctorId?.name} - ${new Date(apptDate).toLocaleDateString('en-IN')} ${apptTime}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color:#2BA8D1; margin-bottom: 8px;">Appointment Reminder</h2>
          <p style="margin:0 0 12px 0; color:#333;">This is a reminder for your upcoming appointment.</p>
          <div style="border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
            <p style="margin:6px 0;"><strong>Doctor:</strong> ${reminder.doctorId?.name}</p>
            <p style="margin:6px 0;"><strong>Date:</strong> ${new Date(apptDate).toLocaleDateString('en-IN')}</p>
            <p style="margin:6px 0;"><strong>Time:</strong> ${apptTime}</p>
            <p style="margin:6px 0;"><strong>Branch:</strong> ${reminder.branchId?.branchName}</p>
            <p style="margin:6px 0;"><strong>Address:</strong> ${reminder.branchId?.address}</p>
          </div>
        </div>
      `;
      const patientEmail = reminder.patientId?.email;
      if (patientEmail) {
        await sendEmail({ to: patientEmail, subject, html });
      }
    } catch (e) {
      console.error('Reminder email failed:', e?.message || e);
    }

    // WhatsApp via AiSensy (commented until keys available)
    // if (process.env.AISENSY_API_KEY && reminder.patientId?.contact) {
    //   // Build and send AiSensy request here similar to appointment booking
    // }

    return res.json({ success: true, reminder });
  } catch (error) {
    console.error("sendReminder error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// SuperAdmin: get/update reminder lead times
export const getReminderSettings = async (req, res) => {
  try {
    const settings = await ReminderSettings.findOne();
    return res.json({ success: true, settings: settings || { leadTimesMinutes: [360] } });
  } catch (e) {
    console.error('getReminderSettings error', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateReminderSettings = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== 'superAdmin') {
      return res.status(403).json({ success: false, message: 'Only superAdmin can update settings' });
    }

    const { leadTimesMinutes } = req.body;
    if (!Array.isArray(leadTimesMinutes) || leadTimesMinutes.length === 0) {
      return res.status(400).json({ success: false, message: 'leadTimesMinutes must be a non-empty array' });
    }
    if (!leadTimesMinutes.every(n => Number.isInteger(n) && n >= 0 && n <= 7 * 24 * 60)) {
      return res.status(400).json({ success: false, message: 'Lead times must be integers between 0 and 10080 minutes' });
    }

    const settings = await ReminderSettings.findOneAndUpdate({}, { leadTimesMinutes, updatedBy: req.user._id }, { new: true, upsert: true });
    return res.json({ success: true, settings });
  } catch (e) {
    console.error('updateReminderSettings error', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Cron-like endpoint to send reminders for upcoming appointments
export const processUpcomingReminders = async (req, res) => {
  try {
    const settings = await ReminderSettings.findOne();
    const leadTimes = settings?.leadTimesMinutes?.length ? settings.leadTimesMinutes : [360];

    const now = new Date();
    const horizon = new Date(now.getTime() + Math.max(...leadTimes) * 60000);

    // Find upcoming appointments in the horizon
    const appts = await Appointment.find({
      date: { $gte: now, $lte: horizon },
      status: 'booked'
    }).populate('patientId', 'name email contact')
      .populate('doctorId', 'name')
      .populate('branchId', 'branchName address');

    let sentCount = 0;
    for (const appt of appts) {
      const minutesUntil = Math.round((appt.date.getTime() - now.getTime()) / 60000);
      // Match any configured lead time within +/- 2 minutes window
      if (leadTimes.some(lt => Math.abs(lt - minutesUntil) <= 2)) {
        try {
          const subject = `Appointment Reminder - ${appt.doctorId?.name} - ${appt.date.toLocaleDateString('en-IN')} ${appt.timeSlot}`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style=\"color:#2BA8D1; margin-bottom: 8px;\">Appointment Reminder</h2>
              <p>This is a reminder for your upcoming appointment.</p>
            </div>
          `;
          if (appt.patientId?.email) {
            await sendEmail({ to: appt.patientId.email, subject, html });
            sentCount += 1;
          }
          // WhatsApp via AiSensy (commented)
          // if (process.env.AISENSY_API_KEY && appt.patientId?.contact) { ... }
        } catch (e) {
          console.error('processUpcomingReminders email failed:', e?.message || e);
        }
      }
    }

    return res.json({ success: true, sentCount, checked: appts.length });
  } catch (e) {
    console.error('processUpcomingReminders error', e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

