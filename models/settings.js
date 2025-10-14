import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Website Basic Information
  websiteName: {
    type: String,
    default: 'Aartiket Speech & Hearing Care',
    trim: true,
    maxlength: [100, 'Website name cannot exceed 100 characters']
  },
  websiteDescription: {
    type: String,
    default: 'Professional speech and hearing care services',
    trim: true,
    maxlength: [500, 'Website description cannot exceed 500 characters']
  },
  websiteLogo: {
    publicId: String,
    url: String
  },
  
  // Contact Information
  contactInfo: {
    phone: {
      type: String,
      default: '9867794003',
      trim: true
    },
    email: {
      type: String,
      default: 'aartiketspeechandhearing@gmail.com',
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      default: 'Kalyan, Maharashtra, India',
      trim: true
    },
    website: {
      type: String,
      default: 'aartiketspeechandhearingcare.in',
      trim: true
    }
  },
  
  // Display Settings
  displaySettings: {
    showDoctorsOnAboutPage: {
      type: Boolean,
      default: true
    },
    showTestimonials: {
      type: Boolean,
      default: true
    },
    showServices: {
      type: Boolean,
      default: true
    },
    showContactForm: {
      type: Boolean,
      default: true
    },
    showAppointmentBooking: {
      type: Boolean,
      default: true
    }
  },
  
  // Social Media Links
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    }
  },
  
  // SEO Settings
  seoSettings: {
    metaTitle: {
      type: String,
      default: 'Aartiket Speech & Hearing Care',
      trim: true,
      maxlength: [60, 'Meta title should be under 60 characters']
    },
    metaDescription: {
      type: String,
      default: 'Professional speech and hearing care services in Kalyan. Expert audiologists, modern equipment, and personalized treatment.',
      trim: true,
      maxlength: [160, 'Meta description should be under 160 characters']
    },
    metaKeywords: {
      type: String,
      default: 'hearing aid, audiologist, speech therapy, hearing care, Kalyan',
      trim: true
    }
  },
  
  // System Settings
  systemSettings: {
    maintenanceMode: {
      type: Boolean,
      default: false
    },
    maxFileUploadSize: {
      type: Number,
      default: 5242880, // 5MB in bytes
      min: [1048576, 'Minimum file size should be 1MB'] // 1MB minimum
    },
    sessionTimeout: {
      type: Number,
      default: 3600000, // 1 hour in milliseconds
      min: [300000, 'Minimum session timeout should be 5 minutes'] // 5 minutes minimum
    },
    enableNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Analytics Settings
  analyticsSettings: {
    googleAnalyticsId: {
      type: String,
      trim: true
    },
    facebookPixelId: {
      type: String,
      trim: true
    },
    enableAnalytics: {
      type: Boolean,
      default: false
    }
  },
  
  // Audit fields
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.index({}, { unique: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
