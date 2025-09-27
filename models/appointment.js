import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional - assigned later
    service: { type: String, required: true }, // Service name as string
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
    referredDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "ReferredDoctor" },

    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "10:00-10:30"
    status: { type: String, enum: ["booked", "assigned", "completed", "cancelled"], default: "booked" },

    reminder: { type: Date },
    notes: { type: String, trim: true },

    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
    
    // Additional appointment details
    appointmentType: { 
      type: String, 
      enum: ["consultation", "followup", "emergency", "routine"], 
      default: "consultation" 
    },
    duration: { type: Number, default: 30 }, // in minutes
    charges: { type: Number, default: 0 },
    
    // Assignment details
    assignedAt: { type: Date },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Branch admin who assigned
    
    // Completion details
    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Unique constraint: one appointment per branch, date, and time slot
appointmentSchema.index({ branchId: 1, date: 1, timeSlot: 1 }, { unique: true });

export default mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);


