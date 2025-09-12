import mongoose from "mongoose";
import Patient from "../models/patient.js";
import Branch from "../models/branch.js";

export const getAllPatients = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      branchId, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (branchId) filter.branchId = branchId;

    // Build search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Get patients with populated data
    const patients = await Patient.find(filter)
      .populate('branchId', 'branchName address')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Patient.countDocuments(filter);

    return res.json({
      success: true,
      patients,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPatients: total,
        hasNext: skip + patients.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("getAllPatients error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createPatient = async (req, res) => {
  try {
    const { name, age, gender, contact, email, address, medicalHistory, branchId } = req.body;

    if (!name || !contact) {
      return res.status(400).json({ success: false, message: "Name and contact are required" });
    }

    // Validate branch if provided
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch) {
        return res.status(404).json({ success: false, message: "Branch not found" });
      }
    }

    // Check if patient already exists with same contact or email
    const existingPatient = await Patient.findOne({
      $or: [
        { contact: contact },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    });

    if (existingPatient) {
      return res.status(409).json({ 
        success: false, 
        message: "Patient already exists with this contact number or email" 
      });
    }

    // Create patient
    const patient = await Patient.create({
      name,
      age,
      gender,
      contact,
      email: email ? email.toLowerCase() : undefined,
      address,
      medicalHistory: medicalHistory || [],
      branchId: branchId || undefined
    });

    // Populate branch data
    await patient.populate('branchId', 'branchName address');

    return res.status(201).json({
      success: true,
      patient,
      message: "Patient created successfully"
    });
  } catch (error) {
    console.error("createPatient error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id)
      .populate('branchId', 'branchName address')
      .populate('appointments', 'date timeSlot status doctorId branchId')
      .populate({
        path: 'appointments',
        populate: {
          path: 'doctorId',
          select: 'name specialization'
        }
      })
      .populate({
        path: 'appointments',
        populate: {
          path: 'branchId',
          select: 'branchName address'
        }
      });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.json({
      success: true,
      patient
    });
  } catch (error) {
    console.error("getPatientById error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Validate branch if provided
    if (updateData.branchId) {
      const branch = await Branch.findById(updateData.branchId);
      if (!branch) {
        return res.status(404).json({ success: false, message: "Branch not found" });
      }
    }

    // Check for duplicate contact/email if being updated
    if (updateData.contact || updateData.email) {
      const existingPatient = await Patient.findOne({
        _id: { $ne: id },
        $or: [
          ...(updateData.contact ? [{ contact: updateData.contact }] : []),
          ...(updateData.email ? [{ email: updateData.email.toLowerCase() }] : [])
        ]
      });

      if (existingPatient) {
        return res.status(409).json({ 
          success: false, 
          message: "Another patient already exists with this contact number or email" 
        });
      }
    }

    // Normalize email if provided
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    const patient = await Patient.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('branchId', 'branchName address');

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.json({
      success: true,
      patient,
      message: "Patient updated successfully"
    });
  } catch (error) {
    console.error("updatePatient error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Check if patient has appointments
    if (patient.appointments && patient.appointments.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete patient with existing appointments. Please delete appointments first." 
      });
    }

    await Patient.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Patient deleted successfully"
    });
  } catch (error) {
    console.error("deletePatient error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
