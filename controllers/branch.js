import Branch from "../models/branch.js";

export const createBranchController = async (req, res) => {
  try {
    const { branchName, address, gst, pan, scn, phone, email, status } = req.body;

    if (!branchName || !address) {
      return res.status(400).json({
        success: false,
        message: "Branch name and address are required.",
      });
    }

    const existing = await Branch.findOne({ branchName: branchName.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Branch with this name already exists.",
      });
    }

    const branch = await Branch.create({
      branchName,
      address,
      gst,
      pan,
      scn,
      phone,
      email,
      status,
    });

    res.status(201).json({
      success: true,
      message: "Branch created successfully.",
      branch,
    });
  } catch (err) {
    console.error("Error creating branch:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

export const getAllBranchesController = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { branchName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { gst: { $regex: search, $options: "i" } },
        { pan: { $regex: search, $options: "i" } },
        { scn: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") {
      query.status = status;
    }

    const branches = await Branch.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Branch.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Branches fetched successfully",
      branches,
      page,
      limit,
      total,
      currentPageCount: branches.length,
      totalPage: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error fetching branches:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching branches",
      error: err.message,
    });
  }
};

export const getBranchByIdController = async (req, res) => {
  try {
    const { id } = req.body;

    const branch = await Branch.findById(id);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch fetched successfully",
      branch,
    });
  } catch (err) {
    console.error("Error fetching branch:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const updateBranchController = async (req, res) => {
  try {
    const { id, branchName, address, gst, pan, scn, phone, email, status } = req.body;

    const branch = await Branch.findById(id);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    branch.branchName = branchName || branch.branchName;
    branch.address = address || branch.address;
    branch.gst = gst || branch.gst;
    branch.pan = pan || branch.pan;
    branch.scn = scn || branch.scn;
    branch.phone = phone || branch.phone;
    branch.email = email || branch.email;
    branch.status = status || branch.status;

    await branch.save();

    res.status(200).json({
      success: true,
      message: "Branch updated successfully",
      branch,
    });
  } catch (err) {
    console.error("Error updating branch:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const deleteBranchController = async (req, res) => {
  try {
    const { branchId } = req.body;

    const branch = await Branch.findByIdAndDelete(branchId);
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: "Branch not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting branch:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};
