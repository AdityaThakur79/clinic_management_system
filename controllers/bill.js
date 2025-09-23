import Bill from "../models/bill.js";

export const getAllBills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      branchId,
      doctorId,
      paymentStatus,
      paymentMethod,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search = ''
    } = req.query;

    const filter = {};
    if (branchId) filter.branchId = branchId;
    if (doctorId) filter.doctorId = doctorId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) {
      filter.$or = [
        { billNumber: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [bills, total] = await Promise.all([
      Bill.find(filter)
        .populate('patientId', 'name contact')
        .populate('doctorId', 'name specialization')
        .populate('branchId', 'branchName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Bill.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      bills,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBills: total
      }
    });
  } catch (error) {
    console.error('getAllBills error', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// Get detailed bill for a specific appointment
export const getBillByAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    if (!appointmentId) {
      return res.status(400).json({ success: false, message: 'appointmentId is required' });
    }

    const bill = await Bill.findOne({ appointmentId })
      .populate('patientId', 'name contact email address plan')
      .populate('doctorId', 'name specialization email')
      .populate('branchId', 'branchName address')
      .populate('appointmentId', 'date timeSlot status');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found for this appointment' });
    }

    return res.json({ success: true, bill });
  } catch (error) {
    console.error('getBillByAppointment error', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get bill by bill id with full details
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id)
      .populate('patientId', 'name contact email address plan')
      .populate('doctorId', 'name specialization email')
      .populate('branchId', 'branchName address')
      .populate('appointmentId', 'date timeSlot status');

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    return res.json({ success: true, bill });
  } catch (error) {
    console.error('getBillById error', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


