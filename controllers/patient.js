import mongoose from "mongoose";
import Patient from "../models/patient.js";
import Branch from "../models/branch.js";
import Appointment from "../models/appointment.js";
import Prescription from "../models/prescription.js";
import Bill from "../models/bill.js";
import ReferredDoctor from "../models/referredDoctor.js";
import { Reminder } from "../models/reminder.js";
import { User } from "../models/user.js";

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
      .populate('referredDoctorId', 'name clinicName')
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
    const { name, age, gender, contact, email, address, medicalHistory, branchId, referredDoctorId, referralDate } = req.body;

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

    // Validate referred doctor if provided
    if (referredDoctorId) {
      const refDoc = await ReferredDoctor.findById(referredDoctorId);
      if (!refDoc) {
        return res.status(404).json({ success: false, message: "Referred doctor not found" });
      }
    }

    // Normalize contact to digits and email to lowercase for uniqueness check
    const normalizedContact = typeof contact === 'string' ? contact.replace(/\D/g, '') : contact;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;

    // Check if patient already exists with same contact or email (case/format insensitive)
    const existingPatient = await Patient.findOne({
      $or: [
        ...(normalizedContact ? [{ contact: normalizedContact }] : []),
        ...(normalizedEmail ? [{ email: normalizedEmail }] : [])
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
      contact: normalizedContact,
      email: normalizedEmail,
      address,
      medicalHistory: medicalHistory || [],
      branchId: branchId || undefined,
      referredDoctorId: referredDoctorId || undefined,
      referralDate: referralDate || undefined
    });

    // Populate branch and referred doctor data
    await patient.populate('branchId', 'branchName address');
    await patient.populate('referredDoctorId', 'name clinicName');

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

// Get detailed patient information with appointments, prescriptions, and bills
export const getPatientDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findById(id)
      .populate('branchId', 'branchName address phone email')
      .populate('referredDoctorId', 'name contact clinicName specialization')
      .populate({
        path: 'appointments',
        populate: [
          {
            path: 'doctorId',
            select: 'name specialization degree'
          },
          {
            path: 'branchId',
            select: 'branchName address'
          },
          {
            path: 'prescriptionId',
            select: 'diagnosis medicines treatment followUpRequired followUpDate'
          },
          {
            path: 'billId',
            select: 'billNumber totalAmount paymentStatus billDate'
          }
        ]
      });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    // Get additional statistics
    const totalAppointments = patient.appointments.length;
    const completedAppointments = patient.appointments.filter(apt => apt.status === 'completed').length;
    const totalBills = patient.appointments.filter(apt => apt.billId).length;
    const totalAmount = patient.appointments
      .filter(apt => apt.billId)
      .reduce((sum, apt) => sum + (apt.billId?.totalAmount || 0), 0);

    return res.json({
      success: true,
      patient,
      statistics: {
        totalAppointments,
        completedAppointments,
        totalBills,
        totalAmount,
        pendingAppointments: totalAppointments - completedAppointments
      }
    });
  } catch (error) {
    console.error("getPatientDetails error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Complete appointment with prescription and billing
export const completeAppointment = async (req, res) => {
  try {
    console.log("completeAppointment called with:", { appointmentId: req.params.appointmentId, body: req.body });
    const { appointmentId } = req.params;
    const { prescription, bill, patientUpdate, reminder: reminderBody } = req.body;
    
    // Validate appointmentId format
    if (!appointmentId || !appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("Invalid appointment ID format:", appointmentId);
      return res.status(400).json({ success: false, message: "Invalid appointment ID format" });
    }
    
    // Extract prescription data
    const {
      diagnosis = '',
      symptoms = [],
      medicines = [],
      treatment = '',
      followUpRequired = false,
      followUpDate = null,
      followUpNotes = '',
      doctorNotes = '',
      patientInstructions = ''
    } = prescription || {};

    // Extract bill data
    const {
      consultationFee = 0,
      treatmentFee = 0,
      medicineFee = 0,
      otherCharges = 0,
      hearingAidFee = 0,
      audiometryFee = 0,
      discount = 0,
      discountType = 'general',
      discountPercentage = 0,
      taxPercentage,
      paymentMethod = 'cash',
      paidAmount = 0,
      notes = '',
      services = [],
      devices = []
    } = bill || {};

    const doctorId = req.user?.userId || req.id;
    console.log("Doctor ID:", doctorId);
    
    if (!doctorId) {
      console.log("No doctor ID found in request");
      return res.status(401).json({ success: false, message: "Doctor ID not found" });
    }

    // Get appointment details
    console.log("Looking for appointment with ID:", appointmentId);
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId');

    console.log("Appointment found:", appointment ? "Yes" : "No");
    if (appointment) {
      console.log("Appointment status:", appointment.status);
      console.log("Patient ID:", appointment.patientId?._id);
    }

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ success: false, message: "Appointment already completed" });
    }

    // Create prescription
    console.log("Creating prescription with data:", {
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId,
      branchId: appointment.branchId,
      diagnosis: diagnosis || '',
      medicines: medicines || []
    });
    
    let prescriptionDoc;
    try {
      prescriptionDoc = await Prescription.create({
        appointmentId,
        patientId: appointment.patientId._id,
        doctorId,
        branchId: appointment.branchId,
        diagnosis: diagnosis || '',
        symptoms: symptoms || [],
        medicines: medicines || [],
        treatment: treatment || '',
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate || null,
        followUpNotes: followUpNotes || '',
        doctorNotes: doctorNotes || '',
        patientInstructions: patientInstructions || ''
      });
      console.log("Prescription created successfully:", prescriptionDoc._id);
    } catch (prescriptionError) {
      console.error("Prescription creation error:", prescriptionError);
      return res.status(500).json({ success: false, message: "Failed to create prescription", error: prescriptionError.message });
    }

    // Parse numeric values
    const consultationFeeNum = parseFloat(consultationFee) || 0;
    const treatmentFeeNum = parseFloat(treatmentFee) || 0;
    const medicineFeeNum = parseFloat(medicineFee) || 0;
    const otherChargesNum = parseFloat(otherCharges) || 0;
    const hearingAidFeeNum = parseFloat(hearingAidFee) || 0;
    const audiometryFeeNum = parseFloat(audiometryFee) || 0;
    const discountNum = parseFloat(discount) || 0;
    const discountPercentageNum = parseFloat(discountPercentage) || 0;
    const taxPercentageNum = (taxPercentage === undefined || taxPercentage === null || taxPercentage === '')
      ? 0
      : (parseFloat(taxPercentage) || 0);
    const paidAmountNum = parseFloat(paidAmount) || 0;

    // Handle wallet plan logic for consultation fee
    let finalConsultationFee = consultationFeeNum;
    if (appointment.patientId.plan?.type === 'wallet') {
      const perVisitCharge = appointment.patientId.plan.perVisitCharge || 0;
      if (perVisitCharge > 0) {
        finalConsultationFee = perVisitCharge;
        console.log(`Wallet plan: Using per-visit charge ${perVisitCharge} instead of consultation fee ${consultationFeeNum}`);
      }
    }
    
    // Process services ensuring schema fields (actualPrice/basePrice) are set
    const processedServices = (services || []).map(service => {
      const base = parseFloat(service.basePrice ?? service.price ?? 0) || 0;
      const actual = parseFloat(service.actualPrice ?? service.price ?? base) || 0;
      return {
        serviceId: service.serviceId,
        name: service.name || '',
        description: service.description || '',
        basePrice: base,
        actualPrice: actual,
        discount: parseFloat(service.discount) || 0,
        discountType: service.discountType || 'fixed',
        discountPercentage: parseFloat(service.discountPercentage) || 0,
        notes: service.notes || ''
      };
    });
    
    // Process devices ensuring expected fields
    const processedDevices = (devices || []).map(d => ({
      inventoryId: d.inventoryId,
      deviceName: d.deviceName || '',
      unitPrice: parseFloat(d.unitPrice) || 0,
      quantity: parseInt(d.quantity) || 0,
      notes: d.notes || ''
    }));
    
    console.log("Processed services:", processedServices);
    
    // Create bill - let the pre-save middleware handle subtotal and totalAmount calculations
    console.log("Creating bill with data:", {
      appointmentId,
      patientId: appointment.patientId._id,
      doctorId,
      branchId: appointment.branchId,
      consultationFee: consultationFeeNum,
      services: processedServices
    });
    
    // Calculate totals manually as fallback
    const servicesTotal = processedServices.reduce((sum, service) => sum + (service.actualPrice || service.basePrice || 0), 0);
    const devicesTotal = processedDevices.reduce((sum, d) => sum + ((parseFloat(d.unitPrice)||0) * (parseInt(d.quantity)||0)), 0);
    const subtotal = finalConsultationFee + treatmentFeeNum + medicineFeeNum + otherChargesNum + 
                     hearingAidFeeNum + audiometryFeeNum + servicesTotal + devicesTotal;
    
    // Calculate discount based on type
    let discountAmount = 0;
    if (discountType === 'percentage' && discountPercentageNum > 0) {
      discountAmount = (subtotal * discountPercentageNum) / 100;
    } else {
      discountAmount = discountNum;
    }
    
    // Calculate tax based on percentage
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxPercentageNum > 0 ? (taxableAmount * taxPercentageNum) / 100 : 0;
    const totalAmount = taxableAmount + taxAmount;

    // Determine effective payment when wallet plan and paidAmount not explicitly provided
    let effectivePaymentMethod = paymentMethod || 'cash';
    let effectivePaidAmount = paidAmountNum;
    if (appointment.patientId.plan?.type === 'wallet') {
      const visitCharge = finalConsultationFee;
      if (!paidAmount && (appointment.patientId.plan?.walletAmount || 0) >= visitCharge) {
        effectivePaymentMethod = 'wallet';
        effectivePaidAmount = visitCharge;
      }
    }
    const remainingAmount = totalAmount - effectivePaidAmount;
    let computedPaymentStatus = 'pending';
    if (effectivePaidAmount >= totalAmount && totalAmount > 0) computedPaymentStatus = 'paid';
    else if (effectivePaidAmount > 0 && effectivePaidAmount < totalAmount) computedPaymentStatus = 'partial';
    
    // Generate bill number
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const billNumber = `BILL-${year}${month}${day}-${random}`;
    
    console.log("Manual calculations:", {
      servicesTotal,
      subtotal,
      totalAmount,
      remainingAmount,
      billNumber
    });

    let billDoc;
    try {
      billDoc = await Bill.create({
        appointmentId,
        patientId: appointment.patientId._id,
        doctorId,
        branchId: appointment.branchId,
        consultationFee: finalConsultationFee,
        treatmentFee: treatmentFeeNum,
        medicineFee: medicineFeeNum,
        otherCharges: otherChargesNum,
        hearingAidFee: hearingAidFeeNum,
        audiometryFee: audiometryFeeNum,
        discount: discountAmount,
        discountType: discountType,
        discountPercentage: discountPercentageNum,
        taxPercentage: taxPercentageNum,
        tax: taxAmount,
        services: processedServices,
        devices: processedDevices,
        paymentMethod: effectivePaymentMethod,
        paidAmount: effectivePaidAmount,
        paymentStatus: computedPaymentStatus,
        notes: notes || '',
        // Manually set calculated values
        subtotal: subtotal,
        totalAmount: totalAmount,
        remainingAmount: remainingAmount,
        billNumber: billNumber
      });
      console.log("Bill created successfully:", billDoc._id);
    } catch (billError) {
      console.error("Bill creation error:", billError);
      return res.status(500).json({ success: false, message: "Failed to create bill", error: billError.message });
    }

    // Update patient if patientUpdate data is provided
    if (patientUpdate) {
      const patient = await Patient.findById(appointment.patientId._id);
      if (patient) {
        // Update basic patient information
        if (patientUpdate.name) patient.name = patientUpdate.name;
        if (patientUpdate.age) patient.age = patientUpdate.age;
        if (patientUpdate.gender) patient.gender = patientUpdate.gender;
        if (patientUpdate.contact) patient.contact = patientUpdate.contact;
        if (patientUpdate.email) patient.email = patientUpdate.email;
        if (patientUpdate.address) patient.address = patientUpdate.address;
        
        // Update patient plan
        if (patientUpdate.plan) {
          const validPlanTypes = ['standard', 'wallet', 'custom'];
          let planType = patientUpdate.plan.type || patient.plan?.type || 'standard';
          
          if (!validPlanTypes.includes(planType)) {
            console.log("Invalid plan type:", planType, "using standard instead");
            planType = 'standard';
          }
          
          patient.plan = {
            type: planType,
            walletAmount: parseFloat(patientUpdate.plan.walletAmount) || patient.plan?.walletAmount || 0,
            visitsRemaining: parseInt(patientUpdate.plan.visitsRemaining) || patient.plan?.visitsRemaining || 0,
            perVisitCharge: parseFloat(patientUpdate.plan.perVisitCharge) || patient.plan?.perVisitCharge || 0
          };
          
          console.log("Updated patient plan:", patient.plan);
        }
        
        await patient.save();
      }
    }

    // Ensure referred doctor is attached to appointment if patient has one
    if (!appointment.referredDoctorId && appointment.patientId?.referredDoctorId) {
      appointment.referredDoctorId = appointment.patientId.referredDoctorId;
    }

    // Update appointment
    appointment.status = 'completed';
    appointment.prescriptionId = prescriptionDoc._id;
    appointment.billId = billDoc._id;
    appointment.completedAt = new Date();
    appointment.completedBy = doctorId;
    appointment.charges = billDoc.totalAmount;
    await appointment.save();

    // Update patient plan if wallet type
    if (appointment.patientId.plan?.type === 'wallet') {
      const patient = await Patient.findById(appointment.patientId._id);
      if (patient && patient.plan) {
        const visitCharge = patient.plan.perVisitCharge || 0;
        const walletAmount = patient.plan.walletAmount || 0;
        
        if (walletAmount >= visitCharge) {
          patient.plan.walletAmount = walletAmount - visitCharge;
          patient.plan.visitsRemaining = Math.max(0, (patient.plan.visitsRemaining || 0) - 1);
          await patient.save();
          console.log(`Wallet plan: Deducted ${visitCharge} from wallet. Remaining: ${patient.plan.walletAmount}`);
        } else {
          console.log(`Wallet plan: Insufficient funds. Required: ${visitCharge}, Available: ${walletAmount}`);
        }
      }
    }

    // Update referred doctor earnings if applicable
    if (appointment.referredDoctorId) {
      await updateReferredDoctorEarnings(appointment.referredDoctorId, billDoc.totalAmount);
    }

    // Populate the updated appointment
    await appointment.populate([
      { path: 'prescriptionId' },
      { path: 'billId' },
      { path: 'patientId', select: 'name contact email' },
      { path: 'doctorId', select: 'name specialization' }
    ]);

    // Optionally create a reminder (from explicit body or follow-up info)
    try {
      const shouldCreateReminder = (reminderBody && reminderBody.enabled) || (prescription?.followUpRequired && prescription?.followUpDate);
      if (shouldCreateReminder) {
        const reminderDateStr = reminderBody?.reminderDate || prescription?.followUpDate;
        const reminderTimeStr = reminderBody?.reminderTime || '10:00';
        const title = reminderBody?.title || 'Follow-up visit';
        const description = reminderBody?.description || 'Call patient to schedule follow-up visit';
        const priority = reminderBody?.priority || 'medium';
        const method = reminderBody?.method || 'in_app';
        await Reminder.create({
          appointmentId,
          patientId: appointment.patientId._id,
          doctorId,
          branchId: appointment.branchId,
          type: 'follow_up',
          title,
          description,
          reminderDate: new Date(reminderDateStr),
          reminderTime: reminderTimeStr,
          priority,
          method,
          notes: 'Auto-created from completion',
          createdBy: req.user?.userId || req.id,
        });
      }
    } catch (e) {
      console.error('Auto-create reminder (completion) failed:', e?.message || e);
    }

    return res.json({
      success: true,
      message: "Appointment completed successfully",
      appointment,
      prescription: prescriptionDoc,
      bill: billDoc
    });
  } catch (error) {
    console.error("completeAppointment error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a completed appointment: allow edits to bill, prescription, payment status
export const updateCompletedAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { prescription = {}, bill = {}, status, reminder: reminderBody } = req.body || {};

    const appointment = await Appointment.findById(appointmentId)
      .populate('prescriptionId')
      .populate('billId')
      .populate('patientId');
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    if (appointment.status !== 'completed') return res.status(400).json({ success: false, message: 'Only completed appointments can be updated' });

    // Update prescription fields if provided
    if (appointment.prescriptionId && prescription && Object.keys(prescription).length > 0) {
      const p = appointment.prescriptionId;
      const assignIf = (key) => { if (prescription[key] !== undefined) p[key] = prescription[key]; };
      ['diagnosis','symptoms','medicines','treatment','followUpRequired','followUpDate','followUpNotes','doctorNotes','patientInstructions']
        .forEach(assignIf);
      await p.save();
    }

    // Update bill fields and recalc totals
    if (appointment.billId && bill && Object.keys(bill).length > 0) {
      const b = appointment.billId;
      const assignIf = (key) => { if (bill[key] !== undefined) b[key] = bill[key]; };
      ['consultationFee','treatmentFee','medicineFee','otherCharges','hearingAidFee','audiometryFee','discount','discountType','discountPercentage','taxPercentage','paymentMethod','paidAmount','paymentStatus','notes']
        .forEach(assignIf);
      if (bill.services) b.services = bill.services;
      if (bill.devices) b.devices = bill.devices;
      // Trigger pre-save to recalc subtotal/total/tax/remaining
      await b.save();
      // Reflect latest charge on appointment
      appointment.charges = b.totalAmount;
    }

    // Optionally update appointment status among booked/completed/cancelled
    if (status && ['booked','completed','cancelled'].includes(status)) {
      appointment.status = status;
    }

    await appointment.save();

    // Optionally create/update reminder when updating completed appointment
    try {
      if (reminderBody && reminderBody.enabled) {
        const reminderDateStr = reminderBody.reminderDate || prescription?.followUpDate;
        if (reminderDateStr) {
          await Reminder.create({
            appointmentId,
            patientId: appointment.patientId._id,
            doctorId: appointment.doctorId,
            branchId: appointment.branchId,
            type: 'follow_up',
            title: reminderBody.title || 'Follow-up visit',
            description: reminderBody.description || 'Call patient to schedule follow-up visit',
            reminderDate: new Date(reminderDateStr),
            reminderTime: reminderBody.reminderTime || '10:00',
            priority: reminderBody.priority || 'medium',
            method: reminderBody.method || 'in_app',
            notes: 'Auto-created from updateCompletedAppointment',
            createdBy: req.user?.userId || req.id,
          });
        }
      }
    } catch (e) {
      console.error('Auto-create reminder (update) failed:', e?.message || e);
    }

    await appointment.populate([
      { path: 'prescriptionId' },
      { path: 'billId' },
    ]);

    return res.json({ success: true, message: 'Appointment updated', appointment });
  } catch (error) {
    console.error('updateCompletedAppointment error', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Helper function to update referred doctor earnings
const updateReferredDoctorEarnings = async (referredDoctorId, amount) => {
  try {
    const referredDoctor = await ReferredDoctor.findById(referredDoctorId);
    if (!referredDoctor) return;

    const commissionRate = referredDoctor.commissionRate || 10;
    const commissionAmount = (amount * commissionRate) / 100;

    // Update total earnings
    referredDoctor.totalEarningsFromReferred += commissionAmount;
    referredDoctor.commissionAmount += commissionAmount;

    // Update monthly earnings
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    let monthlyEarning = referredDoctor.monthlyEarnings.find(
      earning => earning.month === currentMonth
    );

    if (monthlyEarning) {
      monthlyEarning.earnings += commissionAmount;
      monthlyEarning.appointmentsCount += 1;
    } else {
      referredDoctor.monthlyEarnings.push({
        month: currentMonth,
        year: currentDate.getFullYear(),
        earnings: commissionAmount,
        patientsCount: 0,
        appointmentsCount: 1
      });
    }

    await referredDoctor.save();
  } catch (error) {
    console.error("updateReferredDoctorEarnings error", error);
  }
};

// Get referred doctor details with earnings
export const getReferredDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const referredDoctor = await ReferredDoctor.findById(id)
      .populate('patientsReferredIds', 'name contact email plan')
      .populate('branchId', 'branchName address');

    if (!referredDoctor) {
      return res.status(404).json({ success: false, message: "Referred doctor not found" });
    }

    // Get recent appointments for this referred doctor
    const recentAppointments = await Appointment.find({
      referredDoctorId: id,
      status: 'completed'
    })
      .populate('patientId', 'name contact')
      .populate('doctorId', 'name specialization')
      .populate('billId', 'totalAmount paymentStatus billDate')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate monthly statistics
    const currentDate = new Date();
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      last12Months.push(monthStr);
    }

    const monthlyStats = last12Months.map(month => {
      const earning = referredDoctor.monthlyEarnings.find(e => e.month === month);
      return {
        month,
        earnings: earning ? earning.earnings : 0,
        patientsCount: earning ? earning.patientsCount : 0,
        appointmentsCount: earning ? earning.appointmentsCount : 0
      };
    });

    return res.json({
      success: true,
      referredDoctor,
      recentAppointments,
      monthlyStats,
      statistics: {
        totalPatients: referredDoctor.patientsReferredCount,
        totalEarnings: referredDoctor.totalEarningsFromReferred,
        totalPaid: referredDoctor.totalPaidToDoctor,
        pendingAmount: referredDoctor.totalEarningsFromReferred - referredDoctor.totalPaidToDoctor,
        commissionRate: referredDoctor.commissionRate
      }
    });
  } catch (error) {
    console.error("getReferredDoctorDetails error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all referred doctors with earnings summary
export const getAllReferredDoctors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', branchId } = req.query;

    const filter = { isActive: true };
    if (branchId) filter.branchId = branchId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { clinicName: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { totalEarningsFromReferred: -1 };

    const referredDoctors = await ReferredDoctor.find(filter)
      .populate('branchId', 'branchName address')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReferredDoctor.countDocuments(filter);

    return res.json({
      success: true,
      referredDoctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReferredDoctors: total,
        hasNext: skip + referredDoctors.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error("getAllReferredDoctors error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
