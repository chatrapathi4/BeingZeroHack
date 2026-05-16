// -----------------------------------------
// SupportRequest Model
// Tracks support requests between users and admin
// Status: pending / resolved
// -----------------------------------------
const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['payment', 'production', 'technical', 'other'],
        message: 'Category must be payment, production, technical, or other',
      },
      default: 'other',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'resolved'],
        message: 'Status must be pending or resolved',
      },
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by user and status
supportRequestSchema.index({ userId: 1, createdAt: -1 });
supportRequestSchema.index({ status: 1 });

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);
module.exports = SupportRequest;
