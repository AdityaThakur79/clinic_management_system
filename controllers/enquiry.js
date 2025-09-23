import { Enquiry } from '../models/enquiry.js';
import { User } from '../models/user.js';
import Branch from '../models/branch.js';
import { sendEmail as sendMail } from '../utils/common/sendMail.js';
import { enquiryTemplate } from '../utils/emailTemplate/enquiryTemplate.js';

// Create new enquiry
const createEnquiry = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      locality,
      service,
      preferredDate,
      preferredTime,
      hospitalPreference,
      newsletter,
      source = 'website'
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message || !locality || !service) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create enquiry
    const enquiry = new Enquiry({
      name,
      email,
      phone,
      subject,
      message,
      locality,
      service,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      preferredTime,
      hospitalPreference,
      newsletter: newsletter || false,
      source
    });

    await enquiry.save();

    // Send email notifications
    try {
      // Get super admin and branch admins
      const superAdmins = await User.find({ role: 'superAdmin' });
      const branchAdmins = await User.find({ role: 'branchAdmin' });

      // Send email to super admins
      for (const admin of superAdmins) {
        await sendMail({
          to: admin.email,
          subject: `New Enquiry Received - ${enquiry.service}`,
          html: enquiryTemplate({
            enquiry,
            recipientType: 'admin',
            adminName: admin.name
          })
        });
      }

      // Send email to branch admins
      for (const admin of branchAdmins) {
        await sendMail({
          to: admin.email,
          subject: `New Enquiry Received - ${enquiry.service}`,
          html: enquiryTemplate({
            enquiry,
            recipientType: 'admin',
            adminName: admin.name
          })
        });
      }

      // Send confirmation email to customer
      await sendMail({
        to: enquiry.email,
        subject: 'Thank you for your enquiry - Aartiket Speech & Hearing Care',
        html: enquiryTemplate({
          enquiry,
          recipientType: 'customer',
          customerName: enquiry.name
        })
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the enquiry creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: enquiry
    });

  } catch (error) {
    console.error('Error creating enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all enquiries (with pagination and filters)
const getAllEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { service: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const enquiries = await Enquiry.find(query)
      .populate('assignedTo', 'name email')
      .populate('branch', 'branchName address')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Enquiry.countDocuments(query);

    res.json({
      success: true,
      data: {
        enquiries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEnquiries: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get enquiry by ID
const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findById(id)
      .populate('assignedTo', 'name email')
      .populate('branch', 'branchName address')
      .populate('notes.addedBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      data: enquiry
    });

  } catch (error) {
    console.error('Error fetching enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update enquiry
const updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('branch', 'branchName address');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Enquiry updated successfully',
      data: enquiry
    });

  } catch (error) {
    console.error('Error updating enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add note to enquiry
const addNoteToEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const addedBy = req.user.id;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      {
        $push: {
          notes: {
            note,
            addedBy
          }
        }
      },
      { new: true }
    ).populate('notes.addedBy', 'name email');

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: enquiry
    });

  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete enquiry
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
    }

    res.json({
      success: true,
      message: 'Enquiry deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get enquiry statistics
const getEnquiryStats = async (req, res) => {
  try {
    const stats = await Enquiry.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalEnquiries = await Enquiry.countDocuments();
    const todayEnquiries = await Enquiry.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });

    res.json({
      success: true,
      data: {
        totalEnquiries,
        todayEnquiries,
        statusBreakdown: stats
      }
    });

  } catch (error) {
    console.error('Error fetching enquiry stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

export {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  addNoteToEnquiry,
  deleteEnquiry,
  getEnquiryStats
};
