import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: true
  },
  type: {
    type: String,
    enum: ['appointment', 'follow_up', 'medication', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  reminderTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  method: {
    type: String,
    enum: ['sms', 'email', 'call', 'whatsapp', 'in_app'],
    default: 'in_app'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: null
  },
  recurringEndDate: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
reminderSchema.index({ reminderDate: 1, status: 1 });
reminderSchema.index({ patientId: 1, status: 1 });
reminderSchema.index({ doctorId: 1, reminderDate: 1 });
reminderSchema.index({ branchId: 1, reminderDate: 1 });

export const Reminder = mongoose.model("Reminder", reminderSchema);

// Global reminder settings (single document)
const reminderSettingsSchema = new mongoose.Schema({
  leadTimesMinutes: {
    type: [Number],
    default: [360], // default 6 hours
    validate: arr => arr.every(n => Number.isInteger(n) && n >= 0 && n <= 7 * 24 * 60)
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export const ReminderSettings = mongoose.model('ReminderSettings', reminderSettingsSchema);

