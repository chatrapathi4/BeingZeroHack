// -----------------------------------------
// Payment Controller
// CRUD operations for payment records
// Each user can only manage their own payments
// -----------------------------------------
const Payment = require('../models/Payment');

// @desc    Get all payments for current user
// @route   GET /api/payments
// @access  Private
const getAll = async (req, res, next) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single payment
// @route   GET /api/payments/:id
// @access  Private
const getById = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new payment record
// @route   POST /api/payments
// @access  Private
const create = async (req, res, next) => {
  try {
    const { customerName, amount, status, paymentDate, notes } = req.body;

    // Validate required fields
    if (!customerName || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name and amount.',
      });
    }

    const payment = await Payment.create({
      userId: req.user._id,
      customerName,
      amount,
      status: status || 'pending',
      paymentDate: paymentDate || Date.now(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: 'Payment record created successfully.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment record
// @route   PUT /api/payments/:id
// @access  Private
const update = async (req, res, next) => {
  try {
    let payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Payment record updated successfully.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete payment record
// @route   DELETE /api/payments/:id
// @access  Private
const remove = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment record deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
