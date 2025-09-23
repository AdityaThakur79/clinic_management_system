import mongoose from "mongoose";

const billSchema = new mongoose.Schema(
  {
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },

    // Bill details
    billNumber: { type: String, required: false, unique: true },
    billDate: { type: Date, default: Date.now },
    
    // Charges breakdown
    consultationFee: { type: Number, required: true, min: 0 },
    treatmentFee: { type: Number, default: 0, min: 0 },
    medicineFee: { type: Number, default: 0, min: 0 },
    otherCharges: { type: Number, default: 0, min: 0 },
    hearingAidFee: { type: Number, default: 0, min: 0 },
    audiometryFee: { type: Number, default: 0, min: 0 },
    
    // Discount details
    discount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed', 'general'], default: 'general' },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    
    // Tax details
    taxPercentage: { type: Number, default: 18, min: 0, max: 100 }, // GST percentage
    tax: { type: Number, default: 0, min: 0 }, // Calculated tax amount
    
    // Services with dynamic pricing
    services: [{
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
      name: { type: String, required: false },
      description: { type: String },
      basePrice: { type: Number, required: false, min: 0 }, // Original service price
      actualPrice: { type: Number, required: false, min: 0 }, // Price charged to this patient
      discount: { type: Number, default: 0, min: 0 }, // Service-specific discount
      discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
      discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
      notes: { type: String } // Notes for why this price was set
    }],

  // Devices (inventory items) used/sold in this appointment
  devices: [{
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
    deviceName: { type: String, required: false },
    unitPrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    notes: { type: String }
  }],
    
    // Total calculations
    subtotal: { type: Number, required: false, min: 0 },
    totalAmount: { type: Number, required: false, min: 0 },
    
    // Payment details
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "partial", "cancelled"], 
      default: "pending" 
    },
    paymentMethod: { 
      type: String, 
      enum: ["cash", "card", "upi", "wallet", "insurance"], 
      default: "cash" 
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    remainingAmount: { type: Number, default: 0, min: 0 },
    
    // Payment history
    payments: [{
      amount: { type: Number, required: true, min: 0 },
      method: { type: String, required: true },
      date: { type: Date, default: Date.now },
      transactionId: { type: String, trim: true },
      notes: { type: String, trim: true }
    }],
    
    // Additional details
    notes: { type: String, trim: true },
    dueDate: { type: Date },
    
    // Status
    status: { type: String, enum: ["draft", "sent", "paid", "overdue", "cancelled"], default: "draft" },
  },
  { timestamps: true }
);

// Pre-save middleware to calculate totals
billSchema.pre('save', function(next) {
  console.log("Bill pre-save middleware running");
  console.log("Services:", this.services);
  
  // Calculate services total with dynamic pricing
  const servicesTotal = this.services ? this.services.reduce((sum, service) => {
    let servicePrice = parseFloat(service.actualPrice) || parseFloat(service.basePrice) || 0;
    
    // Apply service-specific discount
    if (service.discount > 0) {
      if (service.discountType === 'percentage') {
        servicePrice = servicePrice - (servicePrice * service.discountPercentage / 100);
      } else {
        servicePrice = servicePrice - service.discount;
      }
    }
    
    console.log(`Service ${service.name}: basePrice=${service.basePrice}, actualPrice=${service.actualPrice}, finalPrice=${servicePrice}`);
    return sum + Math.max(0, servicePrice);
  }, 0) : 0;
  
  // Calculate devices total (unitPrice * quantity)
  const devicesTotal = this.devices ? this.devices.reduce((sum, d) => {
    const qty = parseFloat(d.quantity) || 0;
    const price = parseFloat(d.unitPrice) || 0;
    return sum + Math.max(0, qty * price);
  }, 0) : 0;
  
  console.log("Services total:", servicesTotal);
  
  // Calculate subtotal including all fees, services and devices
  this.subtotal = this.consultationFee + this.treatmentFee + this.medicineFee + 
                  this.otherCharges + this.hearingAidFee + this.audiometryFee + servicesTotal + devicesTotal;
  
  // Calculate discount based on type
  let discountAmount = 0;
  if (this.discountType === 'percentage' && this.discountPercentage > 0) {
    discountAmount = (this.subtotal * this.discountPercentage) / 100;
  } else {
    discountAmount = this.discount || 0;
  }
  
  // Calculate tax based on percentage
  const taxableAmount = this.subtotal - discountAmount;
  this.tax = (taxableAmount * this.taxPercentage) / 100;
  
  // Calculate final total
  this.totalAmount = taxableAmount + this.tax;
  this.remainingAmount = this.totalAmount - this.paidAmount;
  
  console.log("Calculated values:", {
    subtotal: this.subtotal,
    discountAmount: discountAmount,
    tax: this.tax,
    totalAmount: this.totalAmount,
    remainingAmount: this.remainingAmount
  });
  
  next();
});

// Generate bill number
billSchema.pre('save', function(next) {
  console.log("Bill number pre-save middleware running");
  console.log("Current billNumber:", this.billNumber);
  
  if (!this.billNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.billNumber = `BILL-${year}${month}${day}-${random}`;
    console.log("Generated bill number:", this.billNumber);
  }
  next();
});

export default mongoose.models.Bill || mongoose.model("Bill", billSchema);
