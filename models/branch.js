import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    branchName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    gst: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
    },
    scn: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Working days and hours
    workingDays: {
      type: [String],
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    // Flexible working hours for each day
    dailyWorkingHours: {
      Monday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        isWorking: { type: Boolean, default: true }
      },
      Tuesday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        isWorking: { type: Boolean, default: true }
      },
      Wednesday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        isWorking: { type: Boolean, default: true }
      },
      Thursday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        isWorking: { type: Boolean, default: true }
      },
      Friday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        isWorking: { type: Boolean, default: true }
      },
      Saturday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        isWorking: { type: Boolean, default: true }
      },
      Sunday: {
        start: { type: String, default: "09:00" },
        end: { type: String, default: "17:00" },
        isWorking: { type: Boolean, default: false }
      }
    },
    // Legacy working hours (for backward compatibility)
    workingHours: {
      start: {
        type: String,
        default: "09:00",
        validate: {
          validator: function(v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Start time must be in HH:MM format'
        }
      },
      end: {
        type: String,
        default: "17:00",
        validate: {
          validator: function(v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'End time must be in HH:MM format'
        }
      }
    },
    // Default slot duration in minutes
    slotDuration: {
      type: Number,
      default: 30,
      min: 15,
      max: 120
    },
    // Break times (optional)
    breakTimes: [{
      start: {
        type: String,
        validate: {
          validator: function(v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Break start time must be in HH:MM format'
        }
      },
      end: {
        type: String,
        validate: {
          validator: function(v) {
            return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
          },
          message: 'Break end time must be in HH:MM format'
        }
      }
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Branch", branchSchema);
