import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    category: {
      type: String,
      enum: ['consultation', 'treatment', 'medicine', 'test', 'hearing_aid', 'other'],
      default: 'other',
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

  },
  { timestamps: true }
);

export const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema);


