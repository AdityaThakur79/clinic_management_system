import Settings from '../models/settings.js';
import { User } from '../models/user.js';
import { v2 as cloudinary } from 'cloudinary';

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      let updatedBy = null;
      
      // Only try to get user if authenticated
      if (req.user && req.user.userId) {
        const user = await User.findById(req.user.userId);
        if (user) {
          updatedBy = user._id;
        }
      }
      
      settings = await Settings.create({
        updatedBy: updatedBy
      });
    }

    return res.json({ 
      success: true, 
      settings 
    });
  } catch (error) {
    // Error getting settings
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const updateData = req.body;

    // Fetch user data from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Only superAdmin can update settings
    if (user.role !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. SuperAdmin role required." 
      });
    }

    // Handle logo upload
    if (req.files && req.files.websiteLogo) {
      try {
        // Get existing settings to delete old logo
        const existingSettings = await Settings.findOne();
        if (existingSettings && existingSettings.websiteLogo && existingSettings.websiteLogo.publicId) {
          await cloudinary.uploader.destroy(existingSettings.websiteLogo.publicId);
        }

        const logoFile = req.files.websiteLogo[0];
        // Uploading website logo
        
        const result = await cloudinary.uploader.upload(logoFile.path, {
          folder: 'settings',
          resource_type: 'image',
          public_id: `logo-${Date.now()}`
        });
        
        updateData.websiteLogo = {
          url: result.secure_url,
          publicId: result.public_id
        };
        
        // Website logo uploaded successfully
      } catch (logoError) {
        // Website logo upload failed
        return res.status(500).json({
          success: false,
          message: "Failed to upload website logo"
        });
      }
    }

    // Add updatedBy
    updateData.updatedBy = user._id;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const settings = await Settings.findOneAndUpdate(
      {},
      updateData,
      { 
        upsert: true, 
        new: true, 
        runValidators: true 
      }
    ).populate('updatedBy', 'name email');

    return res.json({ 
      success: true, 
      settings,
      message: "Settings updated successfully" 
    });
  } catch (error) {
    // Error updating settings
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSpecificSetting = async (req, res) => {
  try {
    const { section, key, value } = req.body;

    if (!section || !key) {
      return res.status(400).json({ 
        success: false, 
        message: "Section and key are required" 
      });
    }

    // Fetch user data from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Only superAdmin can update settings
    if (user.role !== 'superAdmin') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. SuperAdmin role required." 
      });
    }

    // Validate section and key
    const validSections = ['displaySettings', 'systemSettings', 'analyticsSettings'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid section" 
      });
    }

    // Validate specific key-value combinations
    if (!isValidSettingValue(section, key, value)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid value for the specified key" 
      });
    }

    // First, get or create the settings document
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        updatedBy: user._id
      });
    }

    // Update the specific field
    const updateQuery = { [`${section}.${key}`]: value, updatedBy: user._id };

    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: settings._id },
      updateQuery,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('updatedBy', 'name email');

    return res.json({ 
      success: true, 
      settings: updatedSettings,
      message: "Setting updated successfully" 
    });
  } catch (error) {
    // Error updating specific setting
    return res.status(500).json({ 
      success: false, 
      message: "Server error",
      error: error.message 
    });
  }
};

// Helper function to validate setting values
const isValidSettingValue = (section, key, value) => {
  const validations = {
    displaySettings: {
      showDoctorsOnAboutPage: typeof value === 'boolean',
      showTestimonials: typeof value === 'boolean',
      showServices: typeof value === 'boolean',
      showContactForm: typeof value === 'boolean',
      showAppointmentBooking: typeof value === 'boolean'
    },
    systemSettings: {
      maintenanceMode: typeof value === 'boolean',
      maxFileUploadSize: typeof value === 'number' && value >= 1048576,
      sessionTimeout: typeof value === 'number' && value >= 300000,
      enableNotifications: typeof value === 'boolean'
    },
    analyticsSettings: {
      enableAnalytics: typeof value === 'boolean',
      googleAnalyticsId: typeof value === 'string',
      facebookPixelId: typeof value === 'string'
    }
  };

  return validations[section] && validations[section][key] && validations[section][key];
};
