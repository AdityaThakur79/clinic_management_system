import mongoose from "mongoose";

const user = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone:{
      type: String,
      required: function() {
        return this.role !== "superAdmin";
      },
    },
    role: {
      type: String,
      enum: ["superAdmin", "doctor", "branchAdmin"],
      default: "branchAdmin",
    },
    photoUrl: {
      type: String,
      default: "",
    },
    bannerUrl: {
      type: String,
      default: "",
    },
    photoUrlPublicId: {
      type: String,
      default: "",
    },
    bannerUrlPublicId: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: function() {
        return this.role === "doctor" || this.role === "branchAdmin";
      },
    },
    // Doctor-specific fields
    degree: {
      type: String,
      required: function() {
        return this.role === "doctor";
      },
      trim: true,
    },
    specialization: {
      type: String,
      required: function() {
        return this.role === "doctor";
      },
      trim: true,
    },
    perSessionCharge: {
      type: Number,
      required: function() {
        return this.role === "doctor";
      },
      min: 0,
    },
    yearsOfExperience: {
      type: Number,
      required: function() {
        return this.role === "doctor";
      },
      min: 0,
    },
    consultationTime: {
      type: Number, // in minutes
      default: 30,
      min: 15,
      max: 120,
    },
    bio: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    languages: [{
      type: String,
      trim: true,
    }],
    availableDays: [{
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    }],
    availableTimeSlots: {
      type: Map,
      of: {
        start: {
          type: String, // Format: "09:00"
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
        end: {
          type: String, // Format: "17:00"
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        },
      },
      default: {},
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", user);
