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
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.ReferredDoctor || mongoose.model("ReferredDoctor", referredDoctorSchema);


