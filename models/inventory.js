import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  deviceName: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true,
    maxlength: [100, 'Device name cannot exceed 100 characters']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  serialNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
    maxlength: [100, 'Serial number cannot exceed 100 characters'],
    set: (value) => {
      if (value === undefined || value === null) return undefined;
      const trimmed = String(value).trim();
      return trimmed === '' ? undefined : trimmed;
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Medical Equipment',
      'Surgical Instruments',
      'Diagnostic Tools',
      'Therapeutic Devices',
      'Laboratory Equipment',
      'Office Equipment',
      'IT Equipment',
      'Furniture',
      'Consumables',
      'Other'
    ],
    default: 'Medical Equipment'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['pieces', 'boxes', 'units', 'packs', 'liters', 'kg', 'grams', 'meters', 'sets'],
    default: 'pieces'
  },
  threshold: {
    type: Number,
    required: [true, 'Threshold is required'],
    min: [0, 'Threshold cannot be negative'],
    default: 5
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Current stock cannot be negative'],
    default: 0
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative'],
    default: 0
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative'],
    default: 0
  },
  supplier: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Supplier name cannot exceed 100 characters']
    },
    contact: {
      type: String,
      trim: true,
      maxlength: [20, 'Contact cannot exceed 20 characters']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [100, 'Email cannot exceed 100 characters']
    }
  },
  location: {
    room: {
      type: String,
      trim: true,
      maxlength: [50, 'Room cannot exceed 50 characters']
    },
    shelf: {
      type: String,
      trim: true,
      maxlength: [50, 'Shelf cannot exceed 50 characters']
    },
    position: {
      type: String,
      trim: true,
      maxlength: [50, 'Position cannot exceed 50 characters']
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance', 'Disposed', 'Lost'],
    default: 'Active'
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged'],
    default: 'Good'
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  warrantyExpiry: {
    type: Date
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  deviceImage: {
    publicId: {
      type: String,
      trim: true
    },
    url: {
      type: String,
      trim: true
    }
  },
  dosAndDonts: {
    dos: [{
      type: String,
      trim: true,
      maxlength: [200, 'Each "Do" item cannot exceed 200 characters']
    }],
    donts: [{
      type: String,
      trim: true,
      maxlength: [200, 'Each "Don\'t" item cannot exceed 200 characters']
    }]
  },
  careInstructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Care instructions cannot exceed 1000 characters']
  },
  warrantyInfo: {
    duration: {
      type: String,
      trim: true,
      maxlength: [50, 'Warranty duration cannot exceed 50 characters']
    },
    conditions: {
      type: String,
      trim: true,
      maxlength: [500, 'Warranty conditions cannot exceed 500 characters']
    }
  },
  troubleshooting: [{
    issue: {
      type: String,
      trim: true,
      maxlength: [100, 'Issue description cannot exceed 100 characters']
    },
    solution: {
      type: String,
      trim: true,
      maxlength: [200, 'Solution cannot exceed 200 characters']
    }
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: [true, 'Branch ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Stock movement log
  transactions: [{
    operation: { type: String, enum: ['add', 'reduce', 'set'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true },
    notes: { type: String, trim: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Virtual for low stock alert
inventorySchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.threshold;
});

// Virtual for stock status
inventorySchema.virtual('stockStatus').get(function() {
  if (this.currentStock === 0) return 'Out of Stock';
  if (this.currentStock <= this.threshold) return 'Low Stock';
  return 'In Stock';
});

// Pre-save middleware to update currentStock when quantity changes
inventorySchema.pre('save', function(next) {
  if (this.isModified('quantity')) {
    this.currentStock = this.quantity;
  }
  next();
});

// Method to check if stock is available
inventorySchema.methods.isStockAvailable = function(requiredQuantity) {
  return this.currentStock >= requiredQuantity;
};

// Method to reduce stock
inventorySchema.methods.reduceStock = function(quantity) {
  if (this.isStockAvailable(quantity)) {
    this.currentStock -= quantity;
    return true;
  }
  return false;
};

// Method to add stock
inventorySchema.methods.addStock = function(quantity) {
  this.currentStock += quantity;
  this.quantity += quantity;
};

// Ensure virtual fields are serialized
inventorySchema.set('toJSON', { virtuals: true });
inventorySchema.set('toObject', { virtuals: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;

