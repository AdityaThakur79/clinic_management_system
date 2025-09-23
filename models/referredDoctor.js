import mongoose from "mongoose";

const referredDoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contact: { type: String, trim: true },
    clinicName: { type: String, trim: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
    patientsReferredCount: { type: Number, default: 0 },
    patientsReferredIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Patient" }],
    totalEarningsFromReferred: { type: Number, default: 0 },
    totalPaidToDoctor: { type: Number, default: 0 },
  // Commission payout records
  payments: [{
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    method: { type: String, enum: ['cash','bank','upi','other'], default: 'cash' },
    notes: { type: String, trim: true }
  }],
    
    // Monthly earnings tracking
    monthlyEarnings: [{
      month: { type: String, required: true }, // Format: "2024-01"
      year: { type: Number, required: true },
      earnings: { type: Number, default: 0 },
      patientsCount: { type: Number, default: 0 },
      appointmentsCount: { type: Number, default: 0 }
    }],
    
    // Commission details
    commissionRate: { type: Number, default: 10 }, // Percentage
    commissionAmount: { type: Number, default: 0 },
    
    // Contact details
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    specialization: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.ReferredDoctor || mongoose.model("ReferredDoctor", referredDoctorSchema);


