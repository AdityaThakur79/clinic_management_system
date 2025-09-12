import ReferredDoctor from "../models/referredDoctor.js";

export const createReferredDoctor = async (req, res) => {
  try {
    const { name, contact, clinicName, branchId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Name is required" });
    const doc = await ReferredDoctor.create({ name, contact, clinicName, branchId });
    return res.status(201).json({ success: true, referredDoctor: doc });
  } catch (error) {
    console.error("createReferredDoctor error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listReferredDoctors = async (req, res) => {
  try {
    const { branchId, page = 1, limit = 10, search = "" } = req.query;
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    const filter = { isActive: true };
    if (branchId) filter.branchId = branchId;
    if (search) filter.name = { $regex: search, $options: "i" };

    const [items, total] = await Promise.all([
      ReferredDoctor.find(filter)
        .sort({ name: 1 })
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      ReferredDoctor.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      referredDoctors: items,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.ceil(total / numericLimit),
      },
    });
  } catch (error) {
    console.error("listReferredDoctors error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateReferredDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, clinicName, branchId, isActive } = req.body;
    const doc = await ReferredDoctor.findByIdAndUpdate(
      id,
      { name, contact, clinicName, branchId, isActive },
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
    await ReferredDoctor.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (error) {
    console.error("deleteReferredDoctor error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


