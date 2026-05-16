// -----------------------------------------
// Support Controller
// CRUD for user support requests
// -----------------------------------------
const SupportRequest = require('../models/SupportRequest');

// @desc    Get all support requests for current user
// @route   GET /api/support
// @access  Private
const getUserRequests = async (req, res, next) => {
  try {
    const requests = await SupportRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new support request
// @route   POST /api/support
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const { subject, message, category } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject and message.',
      });
    }

    const request = await SupportRequest.create({
      userId: req.user._id,
      subject,
      message,
      category: category || 'other',
    });

    res.status(201).json({
      success: true,
      message: 'Support request submitted successfully.',
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single support request (user can only view own)
// @route   GET /api/support/:id
// @access  Private
const getRequestById = async (req, res, next) => {
  try {
    const request = await SupportRequest.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserRequests, createRequest, getRequestById };
