import { User } from "../models/user.js";
import Branch from "../models/branch.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const createBranchAdmin = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      branch, 
      phone,
      photoUrl, 
      bannerUrl,
      bio
    } = req.body;

    // Validation
    if (!name || !email || !password || !branch) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password, and branch are required",
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

    // Create branchAdmin
    const branchAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "branchAdmin",
      branch,
      phone: phone || "",
      photoUrl: finalPhotoUrl,
      photoUrlPublicId: finalPhotoUrlPublicId,
      bannerUrl: finalBannerUrl,
      bannerUrlPublicId: finalBannerUrlPublicId,
      status: true,
      bio: bio || "",
    });

    // Remove password from response
    const branchAdminResponse = await User.findById(branchAdmin._id)
      .select("-password")
      .populate("branch", "branchName address phone email");

    return res.status(201).json({
      success: true,
      message: "Branch Admin created successfully",
      branchAdmin: branchAdminResponse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create branch admin",
      error: error.message,
    });
  }
};

export const getAllBranchAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 10, branch, q, status } = req.body;
    const skip = (page - 1) * limit;

    let filter = { role: "branchAdmin" };

    // Text search
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { bio: { $regex: q, $options: "i" } },
      ];
    }

    // Branch filter
    if (branch) {
      filter.branch = branch;
    }

    // Status filter
    if (status) {
      filter.status = status === 'true';
    }

    const branchAdmins = await User.find(filter)
      .select("-password")
      .populate("branch", "branchName address phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    return res.status(200).json({
      success: true,
      branchAdmins,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBranchAdmins: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch admins",
      error: error.message,
    });
  }
};

export const getBranchAdminById = async (req, res) => {
  try {
    const { id } = req.body;

    const branchAdmin = await User.findOne({ _id: id, role: "branchAdmin" })
      .select("-password")
      .populate("branch", "branchName address phone email");

    if (!branchAdmin) {
      return res.status(404).json({
        success: false,
        message: "Branch Admin not found",
      });
    }

    return res.status(200).json({
      success: true,
      branchAdmin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch admin",
      error: error.message,
    });
  }
};

export const updateBranchAdmin = async (req, res) => {
  try {
    const { id } = req.body;
    const { 
      name, 
      email, 
      branch, 
      phone,
      status,
      bio,
    } = req.body;

    // Check if branchAdmin exists
    const branchAdmin = await User.findOne({ _id: id, role: "branchAdmin" });
    if (!branchAdmin) {
      return res.status(404).json({
        success: false,
        message: "Branch Admin not found",
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
    if (email && email !== branchAdmin.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already taken by another user",
        });
      }
    }

    // Handle file uploads
    let photoUrl = branchAdmin.photoUrl;
    let photoUrlPublicId = branchAdmin.photoUrlPublicId;
    let bannerUrl = branchAdmin.bannerUrl;
    let bannerUrlPublicId = branchAdmin.bannerUrlPublicId;

    if (req.files && req.files.profilePhoto) {
      if (branchAdmin.photoUrlPublicId) {
        await cloudinary.uploader.destroy(branchAdmin.photoUrlPublicId);
      }
      photoUrl = req.files.profilePhoto[0].path;
      photoUrlPublicId = req.files.profilePhoto[0].filename;
    }

    if (req.files && req.files.bannerImage) {
      if (branchAdmin.bannerUrlPublicId) {
        await cloudinary.uploader.destroy(branchAdmin.bannerUrlPublicId);
      }
      bannerUrl = req.files.bannerImage[0].path;
      bannerUrlPublicId = req.files.bannerImage[0].filename;
    }

    // Update branchAdmin
    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(branch && { branch }),
      ...(phone !== undefined && { phone }),
      ...(status !== undefined && { status }),
      ...(bio !== undefined && { bio }),
      photoUrl,
      photoUrlPublicId,
      bannerUrl,
      bannerUrlPublicId,
    };

    const updatedBranchAdmin = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .select("-password")
      .populate("branch", "branchName address phone email");

    return res.status(200).json({
      success: true,
      message: "Branch Admin updated successfully",
      branchAdmin: updatedBranchAdmin,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update branch admin",
      error: error.message,
    });
  }
};

export const deleteBranchAdmin = async (req, res) => {
  try {
    const { id } = req.body;

    const branchAdmin = await User.findOne({ _id: id, role: "branchAdmin" });
    if (!branchAdmin) {
      return res.status(404).json({
        success: false,
        message: "Branch Admin not found",
      });
    }

    // Delete associated images from cloudinary
    if (branchAdmin.photoUrlPublicId) {
      await cloudinary.uploader.destroy(branchAdmin.photoUrlPublicId);
    }
    if (branchAdmin.bannerUrlPublicId) {
      await cloudinary.uploader.destroy(branchAdmin.bannerUrlPublicId);
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Branch Admin deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete branch admin",
      error: error.message,
    });
  }
};

export const getBranchAdminsByBranch = async (req, res) => {
  try {
    const { branchId } = req.body;

    const branchAdmins = await User.find({ role: "branchAdmin", branch: branchId })
      .select("-password")
      .populate("branch", "branchName address phone email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      branchAdmins,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch branch admins by branch",
      error: error.message,
    });
  }
};

