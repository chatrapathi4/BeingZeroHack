// -----------------------------------------
// Production Model
// Tracks artisan production entries
// Each entry belongs to a specific user
// -----------------------------------------
const mongoose = require('mongoose');

const productionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
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
    materialsUsed: {
      type: String,
      trim: true,
      default: '',
    },
    productionCost: {
      type: Number,
      required: [true, 'Production cost is required'],
      min: [0, 'Production cost cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries by user and date
productionSchema.index({ userId: 1, date: -1 });

const Production = mongoose.model('Production', productionSchema);
module.exports = Production;
