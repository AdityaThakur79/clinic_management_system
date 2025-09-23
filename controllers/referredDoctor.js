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
      specialization, 
      commissionRate = 10 
    } = req.body;
    
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    
    const doc = await ReferredDoctor.create({ 
      name, 
      contact, 
      clinicName, 
      branchId,
      email,
      address,
      specialization,
      commissionRate
    });
    
    return res.status(201).json({ success: true, referredDoctor: doc });
  } catch (error) {
    console.error("createReferredDoctor error", error);
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
    console.error("listReferredDoctors error", error);
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
    console.error('addCommissionPayment error', e);
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
    console.error('listCommissionPayments error', e);
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
      specialization, 
      commissionRate 
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
        specialization, 
        commissionRate 
      },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, referredDoctor: doc });
  } catch (error) {
    console.error("updateReferredDoctor error", error);
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
    console.error("deleteReferredDoctor error", error);
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
    const billIds = appts.map(a => a.billId).filter(Boolean);
    let totalEarnings = 0;
    if (billIds.length) {
      const bills = await Bill.find({ _id: { $in: billIds } }).select('totalAmount');
      const gross = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
      const rate = doc.commissionRate || 10;
      totalEarnings = (gross * rate) / 100;
      doc.totalEarningsFromReferred = totalEarnings;
      doc.commissionAmount = totalEarnings; // running total
    }

    // Rebuild monthlyEarnings
    doc.monthlyEarnings = [];
    const monthlyAgg = await Appointment.aggregate([
      { $match: { referredDoctorId: doc._id, status: 'completed' } },
      { $lookup: { from: 'bills', localField: 'billId', foreignField: '_id', as: 'b' } },
      { $unwind: '$b' },
      { $addFields: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } } },
      { $group: { _id: '$month', total: { $sum: '$b.totalAmount' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    monthlyAgg.forEach(m => {
      const earnings = ((m.total || 0) * (doc.commissionRate || 10)) / 100;
      doc.monthlyEarnings.push({ month: m._id, year: parseInt(m._id.split('-')[0], 10), earnings, patientsCount: 0, appointmentsCount: m.count });
    });

    await doc.save();
    return res.json({ success: true, updated: { patients: doc.patientsReferredCount, totalEarnings: doc.totalEarningsFromReferred } });
  } catch (e) {
    console.error('backfillReferredDoctorData error', e);
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
        totalEarnings: referredDoctor.totalEarningsFromReferred || ((liveRevenue * (referredDoctor.commissionRate || 10)) / 100),
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


