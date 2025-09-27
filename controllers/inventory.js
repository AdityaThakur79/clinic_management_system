import Inventory from '../models/inventory.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

export const createInventory = async (req, res) => {
  try {
    const {
      deviceName,
      model,
      brand,
      serialNumber,
      category,
      quantity,
      unit,
      threshold,
      costPrice,
      sellingPrice,
      supplier,
      location,
      status,
      condition,
      purchaseDate,
      warrantyExpiry,
      description,
      notes,
      dosAndDonts,
      careInstructions,
      warrantyInfo,
      troubleshooting
    } = req.body;

    // Fetch user data from database
    const user = await User.findById(req.user.userId).populate('branch');
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Get branchId from request body (for SuperAdmin) or user's branch
    const branchId = req.body.branchId || user.branch?._id || user.branch;
    const createdBy = user._id;

    // Validate required fields
    if (!deviceName) return res.status(400).json({ success: false, message: "Device name is required" });
    if (!model) return res.status(400).json({ success: false, message: "Model is required" });
    if (!category) return res.status(400).json({ success: false, message: "Category is required" });
    if (quantity === undefined || quantity < 0) return res.status(400).json({ success: false, message: "Valid quantity is required" });
    if (threshold === undefined || threshold < 0) return res.status(400).json({ success: false, message: "Valid threshold is required" });
    if (!branchId) return res.status(400).json({ success: false, message: "Branch ID is required" });
    if (!createdBy) return res.status(400).json({ success: false, message: "User authentication required" });

    // Check for duplicate serial number if provided
    if (serialNumber) {
      const existingInventory = await Inventory.findOne({ 
        serialNumber, 
        branchId, 
        isActive: true 
      });
      if (existingInventory) {
        return res.status(400).json({ 
          success: false, 
          message: "Serial number already exists in this branch" 
        });
      }
    }

    // Handle device image upload
    let deviceImage = null;
    if (req.files && req.files.deviceImage) {
      try {
        const imageFile = req.files.deviceImage[0];
        console.log('Uploading device image:', imageFile.originalname);
        
        const result = await cloudinary.uploader.upload(imageFile.path, {
          folder: 'inventory',
          resource_type: 'image',
          public_id: `device-${Date.now()}`
        });
        
        deviceImage = {
          url: result.secure_url,
          publicId: result.public_id
        };
        
        console.log('Device image uploaded successfully:', deviceImage);
      } catch (imageError) {
        console.error('Device image upload failed:', imageError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload device image"
        });
      }
    }

    const inventory = await Inventory.create({
      deviceName,
      model,
      brand,
      serialNumber,
      category,
      quantity,
      unit,
      threshold,
      currentStock: quantity, // Set current stock equal to quantity
      costPrice,
      sellingPrice,
      supplier,
      location,
      status,
      condition,
      purchaseDate,
      warrantyExpiry,
      description,
      notes,
      deviceImage,
      dosAndDonts: dosAndDonts ? JSON.parse(dosAndDonts) : { dos: [], donts: [] },
      careInstructions,
      warrantyInfo: warrantyInfo ? JSON.parse(warrantyInfo) : { duration: '', conditions: '' },
      troubleshooting: troubleshooting ? JSON.parse(troubleshooting) : [],
      branchId,
      createdBy
    });

    return res.status(201).json({ 
      success: true, 
      inventory,
      message: "Inventory item created successfully" 
    });
  } catch (error) {
    console.error("createInventory error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listInventories = async (req, res) => {
  try {
    const { 
      branchId, 
      page = 1, 
      limit = 10, 
      search = "", 
      category = "",
      status = "",
      condition = "",
      sortBy = "createdAt", 
      sortOrder = "desc",
      lowStock = false
    } = req.query;

    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

    // Build filter
    const filter = { isActive: true };
    
    // Fetch user data from database
    const user = await User.findById(req.user.userId).populate('branch');
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Branch filter - superAdmin can see all, others see only their branch
    if (user.role !== 'superAdmin') {
      const userBranchId = user.branch?._id || user.branch;
      const finalBranchId = branchId || userBranchId;
      
      // Convert to ObjectId for proper comparison
      if (finalBranchId) {
        filter.branchId = new mongoose.Types.ObjectId(finalBranchId);
      }
    } else if (branchId) {
      // superAdmin can filter by specific branch if provided
      filter.branchId = new mongoose.Types.ObjectId(branchId);
    }
    // If superAdmin and no branchId specified, show all branches (no branchId filter)
    

    // Search filter
    if (search) {
      filter.$or = [
        { deviceName: { $regex: search, $options: "i" } },
        { model: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Condition filter
    if (condition) {
      filter.condition = condition;
    }

    // Low stock filter
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$currentStock', '$threshold'] };
    }

    // Sort
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [items, total] = await Promise.all([
      Inventory.find(filter)
        .populate('branchId', 'branchName address')
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email')
        .sort(sort)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit),
      Inventory.countDocuments(filter),
    ]);
    

    // Calculate statistics
    const stats = await Inventory.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$threshold'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
            }
          }
        }
      }
    ]);

    const statistics = stats[0] || {
      totalItems: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };

    return res.json({
      success: true,
      inventories: items,
      statistics,
      pagination: {
        page: numericPage,
        limit: numericLimit,
        total,
        totalPages: Math.ceil(total / numericLimit),
        hasNext: numericPage * numericLimit < total,
        hasPrev: numericPage > 1
      },
    });
  } catch (error) {
    console.error("listInventories error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid inventory ID format" 
      });
    }

    const inventory = await Inventory.findById(id)
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate({
        path: 'transactions.appointmentId',
        select: 'date timeSlot status doctorId patientId billId',
        populate: [
          { path: 'doctorId', select: 'name' },
          { path: 'patientId', select: 'name contact' },
          { path: 'billId', select: 'billNumber totalAmount' }
        ]
      })
      .populate({ path: 'transactions.patientId', select: 'name contact' })
      .populate({ path: 'transactions.billId', select: 'billNumber totalAmount' })
      .populate({ path: 'transactions.userId', select: 'name email' });

    if (!inventory) {
      return res.status(404).json({ 
        success: false, 
        message: "Inventory item not found" 
      });
    }

    // Sort transactions descending by createdAt for convenience
    const invObj = inventory.toObject();
    if (Array.isArray(invObj.transactions)) {
      invObj.transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return res.json({ success: true, inventory: invObj });
  } catch (error) {
    console.error("getInventoryById error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid inventory ID format" 
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.branchId;

    // Fetch user data from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Add updatedBy
    updateData.updatedBy = user._id;

    // Handle device image upload
    if (req.files && req.files.deviceImage) {
      try {
        // Get existing inventory to delete old image
        const existingInventory = await Inventory.findById(id);
        if (existingInventory && existingInventory.deviceImage && existingInventory.deviceImage.publicId) {
          await cloudinary.uploader.destroy(existingInventory.deviceImage.publicId);
        }

        const imageFile = req.files.deviceImage[0];
        console.log('Uploading new device image:', imageFile.originalname);
        
        const result = await cloudinary.uploader.upload(imageFile.path, {
          folder: 'inventory',
          resource_type: 'image',
          public_id: `device-${Date.now()}`
        });
        
        updateData.deviceImage = {
          url: result.secure_url,
          publicId: result.public_id
        };
        
        console.log('Device image updated successfully:', updateData.deviceImage);
      } catch (imageError) {
        console.error('Device image upload failed:', imageError);
        return res.status(500).json({
          success: false,
          message: "Failed to upload device image"
        });
      }
    }

    // Parse JSON fields if they exist
    if (updateData.dosAndDonts && typeof updateData.dosAndDonts === 'string') {
      updateData.dosAndDonts = JSON.parse(updateData.dosAndDonts);
    }
    if (updateData.warrantyInfo && typeof updateData.warrantyInfo === 'string') {
      updateData.warrantyInfo = JSON.parse(updateData.warrantyInfo);
    }
    if (updateData.troubleshooting && typeof updateData.troubleshooting === 'string') {
      updateData.troubleshooting = JSON.parse(updateData.troubleshooting);
    }

    // If quantity is being updated, sync currentStock with quantity
    if (updateData.quantity !== undefined) {
      updateData.currentStock = updateData.quantity;
    }

    // Check for duplicate serial number if being updated
    if (updateData.serialNumber) {
      const existingInventory = await Inventory.findOne({ 
        serialNumber: updateData.serialNumber, 
        branchId: req.user.branch?._id || req.user.branch,
        isActive: true,
        _id: { $ne: id }
      });
      if (existingInventory) {
        return res.status(400).json({ 
          success: false, 
          message: "Serial number already exists in this branch" 
        });
      }
    }

    const inventory = await Inventory.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('branchId', 'branchName address')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!inventory) {
      return res.status(404).json({ 
        success: false, 
        message: "Inventory item not found" 
      });
    }

    return res.json({ 
      success: true, 
      inventory,
      message: "Inventory item updated successfully" 
    });
  } catch (error) {
    console.error("updateInventory error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid inventory ID format" 
      });
    }

    // Fetch user data from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const inventory = await Inventory.findByIdAndUpdate(
      id,
      { isActive: false, updatedBy: user._id },
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({ 
        success: false, 
        message: "Inventory item not found" 
      });
    }

    return res.json({ 
      success: true, 
      message: "Inventory item deleted successfully" 
    });
  } catch (error) {
    console.error("deleteInventory error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { operation, quantity, notes, appointmentId, patientId, billId, reason } = req.body; // operation: 'add', 'reduce', 'set'

    if (!id || typeof id !== 'string' || id.length !== 24) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid inventory ID format" 
      });
    }

    if (!operation || !['add', 'reduce', 'set'].includes(operation)) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid operation is required (add, reduce, set)" 
      });
    }

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Valid quantity is required" 
      });
    }

    const inventory = await Inventory.findById(id);
    if (!inventory) {
      return res.status(404).json({ 
        success: false, 
        message: "Inventory item not found" 
      });
    }

    let newStock;
    switch (operation) {
      case 'add':
        newStock = inventory.currentStock + quantity;
        inventory.quantity += quantity;
        break;
      case 'reduce':
        if (inventory.currentStock < quantity) {
          return res.status(400).json({ 
            success: false, 
            message: "Insufficient stock" 
          });
        }
        newStock = inventory.currentStock - quantity;
        inventory.quantity -= quantity;
        break;
      case 'set':
        newStock = quantity;
        inventory.quantity = quantity;
        break;
    }

    inventory.currentStock = newStock;
    // Fetch user data from database
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    inventory.updatedBy = user._id;
    
    if (notes) {
      inventory.notes = (inventory.notes || '') + `\n[${new Date().toISOString()}] Stock ${operation}: ${quantity}. ${notes}`;
    }

    // Log transaction
    inventory.transactions = inventory.transactions || [];
    inventory.transactions.push({
      operation,
      quantity,
      balanceAfter: newStock,
      reason: reason || (operation === 'reduce' ? 'Used in appointment' : 'Manual update'),
      notes,
      appointmentId: appointmentId || undefined,
      patientId: patientId || undefined,
      billId: billId || undefined,
      userId: user._id,
      createdAt: new Date()
    });

    await inventory.save();

    return res.json({ 
      success: true, 
      inventory,
      message: `Stock ${operation}ed successfully` 
    });
  } catch (error) {
    console.error("updateStock error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getInventoryAnalytics = async (req, res) => {
  try {
    const { branchId } = req.query;
    
    // Fetch user data from database
    const user = await User.findById(req.user.userId).populate('branch');
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Branch filter - superAdmin can see all, others see only their branch
    let finalBranchId = null;
    if (user.role !== 'superAdmin') {
      const userBranchId = user.branch?._id || user.branch;
      const filterBranchId = branchId || userBranchId;
      finalBranchId = filterBranchId ? new mongoose.Types.ObjectId(filterBranchId) : null;
    } else if (branchId) {
      // superAdmin can filter by specific branch if provided
      finalBranchId = new mongoose.Types.ObjectId(branchId);
    }
    // If superAdmin and no branchId specified, show all branches (no branchId filter)

    const matchCondition = { isActive: true };
    if (finalBranchId) {
      matchCondition.branchId = finalBranchId;
    }

    const analytics = await Inventory.aggregate([
      { 
        $match: matchCondition
      },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } },
          lowStockItems: {
            $sum: {
              $cond: [{ $lte: ['$currentStock', '$threshold'] }, 1, 0]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0]
            }
          },
          categoryStats: {
            $push: {
              category: '$category',
              quantity: '$currentStock',
              value: { $multiply: ['$currentStock', '$costPrice'] }
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalItems: 1,
          totalValue: 1,
          lowStockItems: 1,
          outOfStockItems: 1,
          inStockItems: { $subtract: ['$totalItems', '$outOfStockItems'] },
          categoryBreakdown: {
            $reduce: {
              input: '$categoryStats',
              initialValue: {},
              in: {
                $mergeObjects: [
                  '$$value',
                  {
                    $arrayToObject: [
                      {
                        $map: {
                          input: [{ k: '$$this.category', v: { $add: ['$$this.quantity', { $ifNull: [{ $getField: { field: '$$this.category', input: '$$value' } }, 0] }] } }],
                          as: 'item',
                          in: '$$item'
                        }
                      }
                    ]
                  }
                ]
              }
            }
          }
        }
      }
    ]);

    return res.json({
      success: true,
      analytics: analytics[0] || {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        inStockItems: 0,
        categoryBreakdown: {}
      }
    });
  } catch (error) {
    console.error("getInventoryAnalytics error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

