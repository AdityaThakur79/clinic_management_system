import ReferredDoctor from "../models/referredDoctor.js";
import Appointment from "../models/appointment.js";
import Bill from "../models/bill.js";
import Patient from "../models/patient.js";

export const createReferredDoctor = async (req, res) => {
  try {
    const { 
      name, 
      contact, 
      clinicName, 
      branchId, 
      email, 
      address, 
      specialization
    } = req.body;
    
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    
    const doc = await ReferredDoctor.create({ 
      name, 
      contact, 
      clinicName, 
      branchId,
      email,
      address,
      specialization
    });
    
    return res.status(201).json({ success: true, referredDoctor: doc });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listReferredDoctors = async (req, res) => {
  try {
    const { branchId, page = 1, limit = 10, search = "", sortBy = "totalEarningsFromReferred", sortOrder = "desc", from = "", to = "" } = req.query;
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filter = { isActive: true };
    if (branchId) filter.branchId = branchId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { clinicName: { $regex: search, $options: "i" } },
        { contact: { $regex: search, $options: "i" } }
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
      ReferredDoctor.find(filter)
        .populate('branchId', 'branchName address')
        .sort(sort)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      ReferredDoctor.countDocuments(filter),
    ]);

    // Compute quick rollups for UI if needed
    const dateMatch = {};
    if (from) dateMatch.$gte = new Date(from);
    if (to) {
      const d = new Date(to); d.setHours(23,59,59,999); dateMatch.$lte = d;
    }

    const enriched = await Promise.all(items.map(async (doc) => {
      const apptMatch = { referredDoctorId: doc._id, status: 'completed' };
      if (from || to) apptMatch.createdAt = dateMatch;
      const count = await Appointment.countDocuments(apptMatch);
      const totalAmtAgg = await Appointment.aggregate([
        { $match: apptMatch },
        { $lookup: { from: 'bills', localField: 'billId', foreignField: '_id', as: 'b' } },
        { $unwind: '$b' },
        { $group: { _id: null, amt: { $sum: '$b.totalAmount' } } }
      ]);
      return {
        ...doc.toObject(),
        completedAppointments: count,
        referredRevenue: totalAmtAgg[0]?.amt || 0,
      };
    }));

    return res.json({
      success: true,
      referredDoctors: enriched,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.ceil(total / numericLimit),
        totalReferredDoctors: total,
        hasNext: numericPage * numericLimit < total,
        hasPrev: numericPage > 1
      },
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const addCommissionPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, method = 'cash', notes, date } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });
    const doc = await ReferredDoctor.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: 'Referred doctor not found' });
    doc.payments.push({ amount, method, notes, date: date ? new Date(date) : new Date() });
    doc.totalPaidToDoctor = (doc.totalPaidToDoctor || 0) + amount;
    await doc.save();
    return res.json({ success: true, payment: doc.payments[doc.payments.length - 1], totalPaidToDoctor: doc.totalPaidToDoctor });
  } catch (e) {

    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const listCommissionPayments = async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query;
    const doc = await ReferredDoctor.findById(id).select('payments');
    if (!doc) return res.status(404).json({ success: false, message: 'Referred doctor not found' });
    let payments = doc.payments || [];
    if (year) {
      payments = payments.filter(p => new Date(p.date).getFullYear() === parseInt(year, 10));
    }
    // sort desc
    payments.sort((a,b)=> new Date(b.date) - new Date(a.date));
    return res.json({ success: true, payments });
  } catch (e) {

    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateReferredDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      contact, 
      clinicName, 
      branchId, 
      isActive, 
      email, 
      address, 
      specialization
    } = req.body;
    
    const doc = await ReferredDoctor.findByIdAndUpdate(
      id,
      { 
        name, 
        contact, 
        clinicName, 
        branchId, 
        isActive, 
        email, 
        address, 
        specialization
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, referredDoctor: doc });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteReferredDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid referred doctor ID format" 
      });
    }
    
    const deletedDoctor = await ReferredDoctor.findByIdAndDelete(id);
    
    if (!deletedDoctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Referred doctor not found" 
      });
    }
    
    return res.json({ success: true, message: "Referred doctor deleted successfully" });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Backfill: attach patients to referred doctor and recompute earnings from completed appointments
export const backfillReferredDoctorData = async (req, res) => {
  try {
    const { referredDoctorId } = req.body;
    if (!referredDoctorId || typeof referredDoctorId !== 'string' || referredDoctorId.length !== 24) {
      return res.status(400).json({ success: false, message: 'Valid referredDoctorId is required' });
    }

    const doc = await ReferredDoctor.findById(referredDoctorId);
    if (!doc) return res.status(404).json({ success: false, message: 'Referred doctor not found' });

    // Find all patients who have this referred doctor
    const patients = await Patient.find({ referredDoctorId: referredDoctorId }).select('_id');
    doc.patientsReferredIds = patients.map(p => p._id);
    doc.patientsReferredCount = doc.patientsReferredIds.length;

    // Sum completed appointment bills for this referred doctor
    const appts = await Appointment.find({ referredDoctorId: referredDoctorId, status: 'completed' }).select('billId');
    // Calculate total commission earned from appointments
    const totalCommissionEarned = await Appointment.aggregate([
      { $match: { referredDoctorId: doc._id } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]);
    doc.totalCommissionEarned = totalCommissionEarned[0]?.total || 0;

    // Calculate total commission paid
    const totalCommissionPaid = await Appointment.aggregate([
      { $match: { referredDoctorId: doc._id, commissionPaid: true } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } }
    ]);
    doc.totalCommissionPaid = totalCommissionPaid[0]?.total || 0;

    // Rebuild monthlyEarnings based on actual commission amounts
    doc.monthlyEarnings = [];
    const monthlyAgg = await Appointment.aggregate([
      { $match: { referredDoctorId: doc._id } },
      { $addFields: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } } },
      { $group: { _id: '$month', totalCommission: { $sum: '$commissionAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    monthlyAgg.forEach(m => {
      doc.monthlyEarnings.push({ 
        month: m._id, 
        year: parseInt(m._id.split('-')[0], 10), 
        earnings: m.totalCommission || 0, 
        patientsCount: 0, 
        appointmentsCount: m.count 
      });
    });

    await doc.save();
    return res.json({ success: true, updated: { patients: doc.patientsReferredCount, totalEarnings: doc.totalEarningsFromReferred } });
  } catch (e) {

    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get detailed referred doctor information with earnings
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

    // Live compute current totals for UI consistency
    const liveAgg = await Appointment.aggregate([
      { $match: { referredDoctorId: referredDoctor._id, status: 'completed' } },
      { $lookup: { from: 'bills', localField: 'billId', foreignField: '_id', as: 'b' } },
      { $unwind: '$b' },
      { $group: { _id: null, amt: { $sum: '$b.totalAmount' }, cnt: { $sum: 1 } } }
    ]);
    const liveRevenue = liveAgg[0]?.amt || 0;
    const liveAppointments = liveAgg[0]?.cnt || 0;

    return res.json({
      success: true,
      referredDoctor,
      recentAppointments,
      monthlyStats,
      statistics: {
        totalPatients: referredDoctor.patientsReferredCount,
        totalEarnings: referredDoctor.totalCommissionEarned || 0,
        totalPaid: referredDoctor.totalCommissionPaid || 0,
        pendingAmount: (referredDoctor.totalCommissionEarned || 0) - (referredDoctor.totalCommissionPaid || 0)
      }
    });
  } catch (error) {

    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get referred doctor earnings with appointment details
export const getReferredDoctorEarnings = async (req, res) => {
  try {
    const { referredDoctorId } = req.params;
    const { page = 1, limit = 10, from = "", to = "" } = req.query;
    
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    
    // Find the referred doctor
    const referredDoctor = await ReferredDoctor.findById(referredDoctorId)
      .populate('branchId', 'branchName address');
    
    if (!referredDoctor) {
      return res.status(404).json({ 
        success: false, 
        message: "Referred doctor not found" 
      });
    }
    
    // Build filter for appointments
    const filter = { referredDoctorId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    
    // Get appointments with commission details
    const appointments = await Appointment.find(filter)
      .populate('patientId', 'name email contact')
      .populate('billId', 'totalAmount')
      .populate('branchId', 'branchName address')
      .populate('doctorId', 'name')
      .sort({ date: -1, createdAt: -1 })
      .skip((numericPage - 1) * numericLimit)
      .limit(numericLimit);
    
    // Get total count
    const totalAppointments = await Appointment.countDocuments(filter);
    
    // Calculate earnings summary - use manual calculation instead of aggregation
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
    
    const earningsSummary = [{
      totalAppointments: totalAppointmentsCount,
      totalBillAmount,
      totalCommissionEarned
    }];
    
    const summary = earningsSummary[0] || {
      totalAppointments: 0,
      totalBillAmount: 0,
      totalCommissionEarned: 0
    };

    // Get referred doctor's payment data to calculate actual paid and pending amounts
    const totalCommissionPaid = referredDoctor?.totalPaidToDoctor || 0;
    const pendingCommission = Math.max(0, summary.totalCommissionEarned - totalCommissionPaid);

    // Add the calculated values to summary
    summary.totalCommissionPaid = totalCommissionPaid;
    summary.pendingCommission = pendingCommission;
    summary.paidAppointments = summary.totalAppointments; // All appointments with commission are considered "paid" through the payment system
    summary.pendingAppointments = 0; // No pending appointments since we use separate payment tracking
    
    return res.status(200).json({
      success: true,
      referredDoctor: {
        _id: referredDoctor._id,
        name: referredDoctor.name,
        clinicName: referredDoctor.clinicName,
        contact: referredDoctor.contact,
        email: referredDoctor.email,
        specialization: referredDoctor.specialization,
        branchId: referredDoctor.branchId,
        isActive: referredDoctor.isActive
      },
      appointments,
      summary,
      pagination: {
        currentPage: numericPage,
        totalPages: Math.ceil(totalAppointments / numericLimit),
        totalAppointments,
        hasNext: numericPage < Math.ceil(totalAppointments / numericLimit),
        hasPrev: numericPage > 1
      }
    });
  } catch (error) {
    console.error('Error fetching referred doctor earnings:', error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

