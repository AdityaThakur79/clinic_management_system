import { Service } from "../models/services.js";

export const createServiceController = async (req, res) => {
  try {
    const { name, description = "", isActive = true } = req.body || {};
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const doc = await Service.create({
      name: String(name).trim(),
      description,
      isActive: !!isActive,
    });
    return res.status(201).json({ success: true, service: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to create service", error: error.message });
  }
};

export const getAllServicesController = async (req, res) => {
  try {
    const { page = 1, limit = 10, q = "", isActive } = req.query;
    const filter = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }
    if (typeof isActive !== "undefined" && isActive !== "") {
      filter.isActive = String(isActive) === "true";
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Service.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Service.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      services: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch services", error: error.message });
  }
};

export const getServiceByIdController = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Service id is required" });
    const doc = await Service.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Service not found" });
    return res.status(200).json({ success: true, service: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch service", error: error.message });
  }
};

export const updateServiceController = async (req, res) => {
  try {
    const { id, ...rest } = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Service id is required" });

    // Only allow fields that exist on the simplified model
    const update = {};
    if (typeof rest.name !== 'undefined') update.name = String(rest.name).trim();
    if (typeof rest.description !== 'undefined') update.description = rest.description;
    if (typeof rest.isActive !== 'undefined') update.isActive = !!rest.isActive;

    const doc = await Service.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Service not found" });
    return res.status(200).json({ success: true, service: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update service", error: error.message });
  }
};

export const deleteServiceController = async (req, res) => {
  try {
    const { id } = req.body || {};
    if (!id) return res.status(400).json({ success: false, message: "Service id is required" });
    const doc = await Service.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Service not found" });
    return res.status(200).json({ success: true, message: "Service deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to delete service", error: error.message });
  }
};


