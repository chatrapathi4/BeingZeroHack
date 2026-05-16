// -----------------------------------------
// Payment Model
// Tracks payments received from customers
// Status can be 'received' or 'pending'
// -----------------------------------------
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['received', 'pending'],
        message: 'Status must be either received or pending',
      },
      default: 'pending',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by user and date
paymentSchema.index({ userId: 1, paymentDate: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
