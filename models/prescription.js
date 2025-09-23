import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    // Prescription details
    diagnosis: { type: String, required: false, trim: true },
    symptoms: [{ type: String, trim: true }],
    medicines: [{
      name: { type: String, required: false, trim: true },
      dosage: { type: String, required: false, trim: true },
      frequency: { type: String, required: false, trim: true },
      duration: { type: String, required: false, trim: true },
      instructions: { type: String, trim: true }
    }],
    
    // Treatment details
    treatment: { type: String, trim: true },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    followUpNotes: { type: String, trim: true },
    
    // Additional notes
    doctorNotes: { type: String, trim: true },
    patientInstructions: { type: String, trim: true },
    
    // Status
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);
