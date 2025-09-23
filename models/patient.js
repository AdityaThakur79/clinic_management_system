import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, min: 0 },
    gender: { type: String, enum: ["male", "female", "other", "prefer_not_to_say"], default: "prefer_not_to_say" },
    contact: { type: String, trim: true, unique: true, sparse: true },
    email: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    address: { type: String, trim: true },
    medicalHistory: [{ type: String, trim: true }],
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },

    appointments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Appointment" }],

    plan: {
      type: {
        type: String,
        enum: ["standard", "wallet", "custom"],
        default: "standard",
      },
      walletAmount: { type: Number, default: 0 },
      visitsRemaining: { type: Number, default: 0 },
      perVisitCharge: { type: Number, default: 0 },
    },
    referredDoctorId: { type: mongoose.Schema.Types.ObjectId, ref: "ReferredDoctor" },
    referredBy: { type: String, trim: true },
    referralDate: { type: Date },
  },
  { timestamps: true }
);

// Normalize contact to digits-only before save/update
patientSchema.pre('save', function(next) {
  if (this.isModified('contact') && typeof this.contact === 'string') {
    this.contact = this.contact.replace(/\D/g, '');
  }
  if (this.isModified('email') && typeof this.email === 'string') {
    this.email = this.email.trim().toLowerCase();
  }
  next();
});

patientSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() || {};
  if (update.contact && typeof update.contact === 'string') {
    update.contact = update.contact.replace(/\D/g, '');
  }
  if (update.email && typeof update.email === 'string') {
    update.email = update.email.trim().toLowerCase();
  }
  this.setUpdate(update);
  next();
});

export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);


