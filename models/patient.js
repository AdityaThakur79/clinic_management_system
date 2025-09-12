import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"], default: "prefer_not_to_say" },
    contact: { type: String, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true, index: true },
    address: { type: String, trim: true },
    medicalHistory: [{ type: String, trim: true }],
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],

    plan: {
      type: {
        type: String,
        enum: ["standard", "wallet"],
        default: "standard",
      },
      walletAmount: { type: Number, default: 0 },
      visitsRemaining: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);


