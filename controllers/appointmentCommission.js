import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import ReferredDoctor from "../models/referredDoctor.js";
import Bill from "../models/bill.js";
import Patient from "../models/patient.js";

// Get appointments for a referred doctor
export const getReferredDoctorAppointments = async (req, res) => {
  try {
    const { id: referredDoctorId } = req.params;
    const { page = 1, limit = 10, status = "", from = "", to = "" } = req.query;
    
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    
    // Build filter
    const filter = { referredDoctorId };
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    
    // Get appointments with populated data
    const appointmentsRaw = await Appointment.find(filter)
      .populate('patientId', 'name email contact')
      .populate('billId', 'totalAmount')
      .populate('branchId', 'branchName address')
      .populate('doctorId', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit);
    
    // Convert Mongoose documents to plain objects to ensure _id is accessible
    const appointments = appointmentsRaw.map(appointment => ({
      _id: appointment._id,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      service: appointment.service,
      branchId: appointment.branchId,
      referredDoctorId: appointment.referredDoctorId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      status: appointment.status,
      reminder: appointment.reminder,
      notes: appointment.notes,
      prescriptionId: appointment.prescriptionId,
      billId: appointment.billId,
      appointmentType: appointment.appointmentType,
      duration: appointment.duration,
      charges: appointment.charges,
      assignedAt: appointment.assignedAt,
      assignedBy: appointment.assignedBy,
      completedAt: appointment.completedAt,
      completedBy: appointment.completedBy,
      commissionAmount: appointment.commissionAmount,
      commissionPaid: appointment.commissionPaid,
      commissionPaidAt: appointment.commissionPaidAt,
      commissionPaidBy: appointment.commissionPaidBy,
      commissionNotes: appointment.commissionNotes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));
    
    // Get total count
    const totalAppointments = await Appointment.countDocuments(filter);
    
    // Calculate summary statistics
    console.log('getReferredDoctorAppointments - filter:', JSON.stringify(filter, null, 2));
    
    // First, let's get all appointments for this referred doctor
    const allAppointments = await Appointment.find(filter).populate('billId');
    
    console.log('Manual calculation - allAppointments length:', allAppointments.length);
    console.log('Manual calculation - first appointment:', allAppointments[0]);
    
    // Calculate statistics manually
    const totalAppointmentsCount = allAppointments.length;
    let totalBillAmount = 0;
    let totalCommissionEarned = 0;
    
    allAppointments.forEach((appointment, index) => {
      console.log(`Processing appointment ${index + 1}:`, {
        commissionAmount: appointment.commissionAmount,
        billId: appointment.billId,
        charges: appointment.charges
      });
      
      // Add commission amount
      totalCommissionEarned += appointment.commissionAmount || 0;
      
      // Add bill amount or charges
      if (appointment.billId && appointment.billId.totalAmount) {
        totalBillAmount += appointment.billId.totalAmount;
        console.log(`Using bill totalAmount: ${appointment.billId.totalAmount}`);
      } else {
        totalBillAmount += appointment.charges || 0;
        console.log(`Using charges: ${appointment.charges}`);
      }
    });
    
    console.log('Manual calculation results:', {
      totalAppointmentsCount,
      totalBillAmount,
      totalCommissionEarned
    });
    
    const summary = [{
      totalAppointments: totalAppointmentsCount,
      totalBillAmount,
      totalCommissionEarned
    }];
    
    console.log('getReferredDoctorAppointments - summary result:', JSON.stringify(summary, null, 2));
    
    const stats = summary[0] || {
      totalAppointments: 0,
      totalBillAmount: 0,
      totalCommissionEarned: 0
    };

    // Get referred doctor's payment data to calculate actual paid and pending amounts
    const referredDoctor = await ReferredDoctor.findById(referredDoctorId)
      .select('payments totalPaidToDoctor')
      .populate('branchId', 'branchName address');
    const totalCommissionPaid = referredDoctor?.totalPaidToDoctor || 0;
    const pendingCommission = Math.max(0, stats.totalCommissionEarned - totalCommissionPaid);

    // Add the calculated values to stats
    stats.totalCommissionPaid = totalCommissionPaid;
    stats.pendingCommission = pendingCommission;
    
    console.log('Final stats being returned:', JSON.stringify(stats, null, 2));
    console.log('Referred doctor totalPaidToDoctor:', totalCommissionPaid);

    // Debug appointments data
    console.log('Returning appointments:', appointments.length);
    console.log('Appointments data:', JSON.stringify(appointments.slice(0, 2), null, 2)); // Show first 2 appointments
    if (appointments.length > 0) {
      console.log('First appointment ID:', appointments[0]._id);
      console.log('First appointment keys:', Object.keys(appointments[0]));
      console.log('First appointment _id type:', typeof appointments[0]._id);
      console.log('First appointment commissionAmount:', appointments[0].commissionAmount);
    }
    
    const response = {
      success: true,
      appointments,
      pagination: {
        currentPage: numericPage,
        totalPages: Math.ceil(totalAppointments / numericLimit),
        totalAppointments,
        hasNext: numericPage < Math.ceil(totalAppointments / numericLimit),
        hasPrev: numericPage > 1
      },
      summary: stats,
      referredDoctor: referredDoctor ? {
        _id: referredDoctor._id,
        name: referredDoctor.name,
        clinicName: referredDoctor.clinicName,
        contact: referredDoctor.contact,
        email: referredDoctor.email,
        specialization: referredDoctor.specialization,
        branchId: referredDoctor.branchId,
        isActive: referredDoctor.isActive
      } : null
    };
    
    console.log('API Response summary:', JSON.stringify(stats, null, 2));
    console.log('API Response structure:', JSON.stringify({
      success: response.success,
      appointmentsCount: response.appointments.length,
      summaryKeys: Object.keys(response.summary),
      summary: response.summary
    }, null, 2));
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching referred doctor appointments:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Add commission to an appointment
export const addAppointmentCommission = async (req, res) => {
  try {
    // Support both /appointments/:id/commission and /appointments/:appointmentId/commission
    const { appointmentId, id } = req.params;
    const pathAppointmentId = appointmentId || id;
    const { commissionAmount, notes } = req.body;
    const userId = req.user._id;
    
    console.log('addAppointmentCommission - appointmentId (path):', pathAppointmentId);
    console.log('addAppointmentCommission - appointmentId type:', typeof pathAppointmentId);
    console.log('addAppointmentCommission - commissionAmount:', commissionAmount);
    console.log('addAppointmentCommission - notes:', notes);
    
    if (!commissionAmount || commissionAmount < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid commission amount is required" 
      });
    }
    
    // Check if appointment ID is valid ObjectId
    console.log('addAppointmentCommission - isValid ObjectId:', mongoose.Types.ObjectId.isValid(pathAppointmentId));
    if (!mongoose.Types.ObjectId.isValid(pathAppointmentId)) {
      console.log('addAppointmentCommission - Invalid ObjectId format:', pathAppointmentId);
      return res.status(400).json({ 
        success: false, 
        message: "Invalid appointment ID format" 
      });
    }
    
    // Find the appointment (minimal fields) to validate existence and association
    const appointment = await Appointment.findById(pathAppointmentId)
      .select('referredDoctorId')
      .populate('referredDoctorId');
    
    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: "Appointment not found" 
      });
    }
    
    if (!appointment.referredDoctorId) {
      return res.status(400).json({ 
        success: false, 
        message: "This appointment is not associated with a referred doctor" 
      });
    }
    
    // Update commission fields without triggering full validation on legacy-required fields
    const updated = await Appointment.findByIdAndUpdate(
      pathAppointmentId,
      {
        $set: {
          commissionAmount,
          commissionNotes: notes,
          commissionPaidBy: userId
        }
      },
      { new: true, runValidators: false }
    ).select('_id commissionAmount commissionNotes referredDoctorId');
    
    // Update referred doctor's total commission earned
    const referredDoctor = appointment.referredDoctorId;
    referredDoctor.totalCommissionEarned = await Appointment.aggregate([
      { $match: { referredDoctorId: referredDoctor._id } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]).then(result => result[0]?.total || 0);
    
    await referredDoctor.save();
    
    return res.status(200).json({
      success: true,
      message: "Commission added successfully",
      appointment: {
        _id: updated._id,
        commissionAmount: updated.commissionAmount,
        commissionNotes: updated.commissionNotes
      }
    });
  } catch (error) {
    console.error('Error adding appointment commission:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Mark commission as paid
// markCommissionPaid function removed - using separate commission payment structure instead

// Get commission summary for a referred doctor
export const getCommissionSummary = async (req, res) => {
  try {
    const { id: referredDoctorId } = req.params;
    const { from = "", to = "" } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (from || to) {
      dateFilter.date = {};
      if (from) dateFilter.date.$gte = new Date(from);
      if (to) dateFilter.date.$lte = new Date(to);
    }
    
    const filter = { referredDoctorId, ...dateFilter };
    
    // Get commission statistics - use manual calculation instead of aggregation
    const allAppointments = await Appointment.find(filter).populate('billId');
    
    // Calculate statistics manually
    const totalAppointmentsCount = allAppointments.length;
    let totalBillAmount = 0;
    let totalCommissionEarned = 0;
    
    allAppointments.forEach(appointment => {
      // Add commission amount
      totalCommissionEarned += appointment.commissionAmount || 0;
      
      // Add bill amount or charges
      if (appointment.billId && appointment.billId.totalAmount) {
        totalBillAmount += appointment.billId.totalAmount;
      } else {
        totalBillAmount += appointment.charges || 0;
      }
    });
    
    const stats = [{
      totalAppointments: totalAppointmentsCount,
      totalBillAmount,
      totalCommissionEarned
    }];
    
    const summary = stats[0] || {
      totalAppointments: 0,
      totalBillAmount: 0,
      totalCommissionEarned: 0
    };

    // Get referred doctor's payment data to calculate actual paid and pending amounts
    const referredDoctor = await ReferredDoctor.findById(referredDoctorId).select('payments totalPaidToDoctor');
    const totalCommissionPaid = referredDoctor?.totalPaidToDoctor || 0;
    const pendingCommission = Math.max(0, summary.totalCommissionEarned - totalCommissionPaid);

    // Add the calculated values to summary
    summary.totalCommissionPaid = totalCommissionPaid;
    summary.pendingCommission = pendingCommission;
    summary.paidAppointments = summary.totalAppointments; // All appointments with commission are considered "paid" through the payment system
    summary.pendingAppointments = 0; // No pending appointments since we use separate payment tracking
    
    return res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching commission summary:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
