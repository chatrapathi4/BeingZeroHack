const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [200, 'Customer name cannot exceed 200 characters'],
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    productCost: {
      type: Number,
      required: [true, 'Product cost is required'],
      min: [0, 'Product cost cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    materialsUsed: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    workStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Work status must be pending or completed',
      },
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Payment status must be pending or completed',
      },
      default: 'pending',
    },
    // Flags to prevent duplicate auto-creation
    productionEntryCreated: {
      type: Boolean,
      default: false,
    },
    paymentEntryCreated: {
      type: Boolean,
      default: false,
    },
    // References to auto-created entries for traceability
    linkedProductionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Production',
      default: null,
    },
    linkedPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ workStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
