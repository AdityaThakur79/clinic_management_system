import { User } from "../models/user.js";
import Branch from "../models/branch.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const createDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone,
      branch, 
      photoUrl, 
      bannerUrl,
      degree,
      specialization,
      perSessionCharge,
      yearsOfExperience,
      consultationTime,
      bio,
      languages,
      availableDays,
      availableTimeSlots
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !branch || !degree  || 
        perSessionCharge === undefined || yearsOfExperience === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, phone, branch, degree, per session charge, and years of experience are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }


    // Check if branch exists
    const branchExists = await Branch.findById(branch);
    if (!branchExists) {
      return res.status(400).json({
        success: false,
        message: "Branch not found",
      });
    }

    // Parse JSON fields
    let parsedLanguages = [];
    let parsedAvailableDays = [];
    let parsedAvailableTimeSlots = {};

    try {
      if (languages) {
        parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;
      }
      if (availableDays) {
        parsedAvailableDays = typeof availableDays === 'string' ? JSON.parse(availableDays) : availableDays;
      }
      if (availableTimeSlots) {
        parsedAvailableTimeSlots = typeof availableTimeSlots === 'string' ? JSON.parse(availableTimeSlots) : availableTimeSlots;
      }
    } catch (parseError) {
      console.error('Error parsing JSON fields:', parseError);
      return res.status(400).json({
        success: false,
        message: "Invalid data format for languages, availableDays, or availableTimeSlots",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file uploads
    let finalPhotoUrl = photoUrl || "";
    let finalPhotoUrlPublicId = "";
    let finalBannerUrl = bannerUrl || "";
    let finalBannerUrlPublicId = "";

    if (req.files && req.files.profilePhoto) {
      finalPhotoUrl = req.files.profilePhoto[0].path;
      finalPhotoUrlPublicId = req.files.profilePhoto[0].filename;
    }

    if (req.files && req.files.bannerImage) {
      finalBannerUrl = req.files.bannerImage[0].path;
      finalBannerUrlPublicId = req.files.bannerImage[0].filename;
    }

    // Create doctor
    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "doctor",
      branch,
      photoUrl: finalPhotoUrl,
      photoUrlPublicId: finalPhotoUrlPublicId,
      bannerUrl: finalBannerUrl,
      bannerUrlPublicId: finalBannerUrlPublicId,
      status: true,
      degree,
      specialization,
      perSessionCharge: Number(perSessionCharge),
      yearsOfExperience: Number(yearsOfExperience),
      consultationTime: consultationTime ? Number(consultationTime) : 30,
      bio: bio || "",
      languages: parsedLanguages,
      availableDays: parsedAvailableDays,
      availableTimeSlots: parsedAvailableTimeSlots,
    });

    // Remove password from response
    const doctorResponse = await User.findById(doctor._id)
      .select("-password")
      .populate("branch", "branchName address phone email");

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully",
      doctor: doctorResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create doctor",
      error: error.message,
    });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      branch, 
      q, 
      specialization, 
      minExperience, 
      maxExperience, 
      minCharge, 
      maxCharge 
    } = req.body;

    const skip = (page - 1) * limit;

    let filter = { role: "doctor" };

    // Text search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { specialization: { $regex: q, $options: "i" } },
        { degree: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
      ];
    }

    // Specialization filter
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    // Experience range filter
    if (minExperience || maxExperience) {
      filter.yearsOfExperience = {};
      if (minExperience) filter.yearsOfExperience.$gte = parseInt(minExperience);
      if (maxExperience) filter.yearsOfExperience.$lte = parseInt(maxExperience);
    }

    // Charge range filter
    if (minCharge || maxCharge) {
      filter.perSessionCharge = {};
      if (minCharge) filter.perSessionCharge.$gte = parseInt(minCharge);
      if (maxCharge) filter.perSessionCharge.$lte = parseInt(maxCharge);
    }

    // Branch filter
    if (branch) {
      filter.branch = branch;
    }

    const doctors = await User.find(filter)
      .select("-password")
      .populate("branch", "branchName address phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDoctors: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
      error: error.message,
    });
  }
};

export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.body;

    const doctor = await User.findOne({ _id: id, role: "doctor" })
      .select("-password")
      .populate("branch", "branchName address phone email");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    return res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor",
      error: error.message,
    });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.body;
    const { 
      name, 
      email, 
      phone,
      branch, 
      status,
      degree,
      specialization,
      perSessionCharge,
      yearsOfExperience,
      consultationTime,
      bio,
      languages,
      availableDays,
      availableTimeSlots
    } = req.body;

    // Check if doctor exists
    const doctor = await User.findOne({ _id: id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if branch exists (if branch is being updated)
    if (branch) {
      const branchExists = await Branch.findById(branch);
      if (!branchExists) {
        return res.status(400).json({
          success: false,
          message: "Branch not found",
        });
      }
    }

    // Check if email is already taken by another user
    if (email && email !== doctor.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already taken by another user",
        });
      }
    }


    // Handle file uploads
    let photoUrl = doctor.photoUrl;
    let photoUrlPublicId = doctor.photoUrlPublicId;
    let bannerUrl = doctor.bannerUrl;
    let bannerUrlPublicId = doctor.bannerUrlPublicId;

    if (req.files && req.files.profilePhoto) {
      if (doctor.photoUrlPublicId) {
        await cloudinary.uploader.destroy(doctor.photoUrlPublicId);
      }
      photoUrl = req.files.profilePhoto[0].path;
      photoUrlPublicId = req.files.profilePhoto[0].filename;
    }

    if (req.files && req.files.bannerImage) {
      if (doctor.bannerUrlPublicId) {
        await cloudinary.uploader.destroy(doctor.bannerUrlPublicId);
      }
      bannerUrl = req.files.bannerImage[0].path;
      bannerUrlPublicId = req.files.bannerImage[0].filename;
    }

    // Parse JSON fields for update
    let parsedLanguages = undefined;
    let parsedAvailableDays = undefined;
    let parsedAvailableTimeSlots = undefined;

    if (languages !== undefined) {
      try {
        parsedLanguages = typeof languages === 'string' ? JSON.parse(languages) : languages;
      } catch (parseError) {
        console.error('Error parsing languages:', parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid data format for languages",
        });
      }
    }

    if (availableDays !== undefined) {
      try {
        parsedAvailableDays = typeof availableDays === 'string' ? JSON.parse(availableDays) : availableDays;
      } catch (parseError) {
        console.error('Error parsing availableDays:', parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid data format for availableDays",
        });
      }
    }

    if (availableTimeSlots !== undefined) {
      try {
        parsedAvailableTimeSlots = typeof availableTimeSlots === 'string' ? JSON.parse(availableTimeSlots) : availableTimeSlots;
      } catch (parseError) {
        console.error('Error parsing availableTimeSlots:', parseError);
        return res.status(400).json({
          success: false,
          message: "Invalid data format for availableTimeSlots",
        });
      }
    }

    // Update doctor
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(phone && { phone }),
      ...(branch && { branch }),
      ...(status !== undefined && { status }),
      ...(degree && { degree }),
      ...(specialization && { specialization }),
      ...(perSessionCharge !== undefined && { perSessionCharge: Number(perSessionCharge) }),
      ...(yearsOfExperience !== undefined && { yearsOfExperience: Number(yearsOfExperience) }),
      ...(consultationTime !== undefined && { consultationTime: Number(consultationTime) }),
      ...(bio !== undefined && { bio }),
      ...(parsedLanguages !== undefined && { languages: parsedLanguages }),
      ...(parsedAvailableDays !== undefined && { availableDays: parsedAvailableDays }),
      ...(parsedAvailableTimeSlots !== undefined && { availableTimeSlots: parsedAvailableTimeSlots }),
      photoUrl,
      photoUrlPublicId,
      bannerUrl,
      bannerUrlPublicId,
    };

    const updatedDoctor = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .select("-password")
      .populate("branch", "branchName address phone email");

    return res.status(200).json({
      success: true,
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update doctor",
      error: error.message,
    });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.body;

    const doctor = await User.findOne({ _id: id, role: "doctor" });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Delete associated images from cloudinary
    if (doctor.photoUrlPublicId) {
      await cloudinary.uploader.destroy(doctor.photoUrlPublicId);
    }
    if (doctor.bannerUrlPublicId) {
      await cloudinary.uploader.destroy(doctor.bannerUrlPublicId);
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
      error: error.message,
    });
  }
};

export const getDoctorsByBranch = async (req, res) => {
  try {
    const { branchId } = req.body;

    const doctors = await User.find({ role: "doctor", branch: branchId })
      .select("-password")
      .populate("branch", "branchName address phone email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors by branch",
      error: error.message,
    });
  }
};

export const getDoctorsBySpecialization = async (req, res) => {
  try {
    const { specialization, page = 1, limit = 10, branch } = req.body;
    const skip = (page - 1) * limit;

    let filter = { 
      role: "doctor", 
      specialization: { $regex: specialization, $options: "i" } 
    };
    if (branch) {
      filter.branch = branch;
    }

    const doctors = await User.find(filter)
      .select("-password")
      .populate("branch", "branchName address phone email")
      .sort({ yearsOfExperience: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDoctors: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors by specialization",
      error: error.message,
    });
  }
};

