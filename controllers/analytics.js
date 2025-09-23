import mongoose from "mongoose";
import Appointment from "../models/appointment.js";
import Patient from "../models/patient.js";
import Bill from "../models/bill.js";

// Build a common MongoDB match filter for branch/doctor/time range
const buildMatchFilter = (query) => {
  const match = {};
  const { branchId, doctorId, from, to } = query || {};

  if (branchId) match.branchId = new mongoose.Types.ObjectId(branchId);
  if (doctorId) match.doctorId = new mongoose.Types.ObjectId(doctorId);

  if (from || to) {
    match.createdAt = {};
    if (from) match.createdAt.$gte = new Date(from);
    if (to) match.createdAt.$lte = new Date(to);
  }

  return match;
};

export const getOverview = async (req, res) => {
  try {
    const matchApp = buildMatchFilter(req.query);
    const matchBills = buildMatchFilter(req.query);

    // Patients are branch-scoped; doctor filter via appointments joining is heavy.
    // For simplicity, use branchId on patients; if doctorId provided, count unique patients from matched appointments.
    const { doctorId, branchId } = req.query || {};

    // Totals
    const [
      totalAppointments,
      completedAppointments,
      cancelledAppointments,
      bookedAppointments,
      revenueAggregate,
      billedAggregate,
      paidAggregate,
      outstandingAggregate,
      walletPatientsCount,
      walletPaidAggregate,
    ] = await Promise.all([
      Appointment.countDocuments(matchApp),
      Appointment.countDocuments({ ...matchApp, status: "completed" }),
      Appointment.countDocuments({ ...matchApp, status: "cancelled" }),
      Appointment.countDocuments({ ...matchApp, status: "booked" }),
      Bill.aggregate([
        { $match: matchBills },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
      ]),
      Bill.aggregate([
        { $match: matchBills },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$totalAmount", 0] } } } },
      ]),
      Bill.aggregate([
        { $match: matchBills },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$paidAmount", 0] } } } },
      ]),
      Bill.aggregate([
        { $match: matchBills },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$remainingAmount", 0] } } } },
      ]),
      Patient.countDocuments({ ...(req.query?.branchId ? { branchId: new mongoose.Types.ObjectId(req.query.branchId) } : {}), 'plan.type': 'wallet' }),
      Bill.aggregate([
        { $match: { ...matchBills, paymentMethod: 'wallet' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ["$paidAmount", 0] } } } },
      ]),
    ]);

    let totalPatients = 0;
    if (doctorId) {
      // Unique patients seen by this doctor (and branch if provided)
      const uniquePatientCounts = await Appointment.aggregate([
        { $match: matchApp },
        { $group: { _id: "$patientId" } },
        { $count: "count" },
      ]);
      totalPatients = uniquePatientCounts?.[0]?.count || 0;
    } else if (branchId) {
      totalPatients = await Patient.countDocuments({ branchId: new mongoose.Types.ObjectId(branchId) });
    } else {
      totalPatients = await Patient.countDocuments({});
    }

    const totalRevenue = revenueAggregate?.[0]?.total || 0;
    const totalBilled = billedAggregate?.[0]?.total || 0;
    const totalPaid = paidAggregate?.[0]?.total || 0;
    const totalOutstanding = outstandingAggregate?.[0]?.total || 0;
    const walletCollected = walletPaidAggregate?.[0]?.total || 0;

    // Revenue by month (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const revenueByMonth = await Bill.aggregate([
      {
        $match: {
          ...matchBills,
          createdAt: {
            $gte: twelveMonthsAgo,
            $lte: now,
          },
        },
      },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          amount: { $sum: { $ifNull: ["$totalAmount", 0] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Appointments by status (pie)
    const appointmentsByStatus = await Appointment.aggregate([
      { $match: matchApp },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Payment method split
    const revenueByPaymentMethod = await Bill.aggregate([
      { $match: matchBills },
      { $group: { _id: "$paymentMethod", amount: { $sum: { $ifNull: ["$paidAmount", 0] } } } },
      { $sort: { amount: -1 } },
    ]);

    // Paid vs Outstanding
    const paidVsOutstanding = [
      { label: 'Paid', amount: totalPaid },
      { label: 'Outstanding', amount: totalOutstanding },
    ];

    // Appointments last 7 days (line)
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const appointmentsLast7Days = await Appointment.aggregate([
      { $match: { ...matchApp, createdAt: { $gte: sevenDaysAgo, $lte: now } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Top services from bills
    const topServices = await Bill.aggregate([
      { $match: matchBills },
      { $unwind: { path: "$services", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { name: "$services.name" },
          count: { $sum: 1 },
          revenue: { $sum: { $ifNull: ["$services.actualPrice", { $ifNull: ["$services.basePrice", 0] }] } },
        },
      },
      { $sort: { revenue: -1, count: -1 } },
      { $limit: 5 },
    ]);

    return res.status(200).json({
      success: true,
      filters: { ...req.query },
      totals: {
        totalPatients,
        totalAppointments,
        completedAppointments,
        bookedAppointments,
        cancelledAppointments,
        totalRevenue,
        totalBilled,
        totalPaid,
        totalOutstanding,
        walletPatientsCount,
        walletCollected,
      },
      charts: {
        revenueByMonth,
        appointmentsByStatus,
        appointmentsLast7Days,
        topServices,
        revenueByPaymentMethod,
        paidVsOutstanding,
      },
    });
  } catch (error) {
    console.error("Overview analytics error", error);
    return res.status(500).json({ success: false, message: "Failed to load overview", error: error.message });
  }
};


