// -----------------------------------------
// Admin Controller
// Admin-only operations: user management, analytics,
// support requests, user history
// -----------------------------------------
const User = require('../models/User');
const Production = require('../models/Production');
const Payment = require('../models/Payment');
const SupportRequest = require('../models/SupportRequest');
const Order = require('../models/Order');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own admin account.',
      });
    }

    // Delete user's production, payment, and support data
    await Production.deleteMany({ userId: user._id });
    await Payment.deleteMany({ userId: user._id });
    await SupportRequest.deleteMany({ userId: user._id });
    await Order.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Admin
const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProduction = await Production.countDocuments();
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ workStatus: 'pending' });
    const totalSupportRequests = await SupportRequest.countDocuments();
    const pendingSupportRequests = await SupportRequest.countDocuments({ status: 'pending' });

    const revenueData = await Payment.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);

    const pendingData = await Payment.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, totalPending: { $sum: '$amount' } } },
    ]);

    // Monthly user registrations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'received', paymentDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          totalRevenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProduction,
        totalOrders,
        pendingOrders,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        totalPending: pendingData[0]?.totalPending || 0,
        totalSupportRequests,
        pendingSupportRequests,
        monthlyUsers,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all production entries (admin view)
// @route   GET /api/admin/production
// @access  Admin
const getAllProduction = async (req, res, next) => {
  try {
    const productions = await Production.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: productions.length,
      data: productions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all support requests (admin view)
// @route   GET /api/admin/support
// @access  Admin
const getAllSupportRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const requests = await SupportRequest.find(filter)
      .populate('userId', 'name email avatar')
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

// @desc    Update support request status (resolve)
// @route   PUT /api/admin/support/:id
// @access  Admin
const updateSupportRequest = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const request = await SupportRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Support request not found.',
      });
    }

    if (status) request.status = status;
    if (adminNotes !== undefined) request.adminNotes = adminNotes;
    await request.save();

    const populated = await SupportRequest.findById(request._id)
      .populate('userId', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Support request updated successfully.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed user history (admin view)
// @route   GET /api/admin/users/:id/history
// @access  Admin
const getUserHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const userId = user._id;

    // Get summary counts
    const totalProductions = await Production.countDocuments({ userId });
    const totalPayments = await Payment.countDocuments({ userId });
    const totalSupportRequests = await SupportRequest.countDocuments({ userId });
    const totalOrders = await Order.countDocuments({ userId });

    // Earnings
    const earningsData = await Payment.aggregate([
      { $match: { userId, status: 'received' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Recent production entries (last 10)
    const recentProductions = await Production.find({ userId })
      .sort({ date: -1 })
      .limit(10);

    // Payment history (last 10)
    const recentPayments = await Payment.find({ userId })
      .sort({ paymentDate: -1 })
      .limit(10);

    // Support request history (last 10)
    const recentSupportRequests = await SupportRequest.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent orders (last 10)
    const recentOrders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        summary: {
          totalProductions,
          totalPayments,
          totalSupportRequests,
          totalOrders,
          totalEarnings: earningsData[0]?.total || 0,
        },
        recentProductions,
        recentPayments,
        recentSupportRequests,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  getAnalytics,
  getAllProduction,
  getAllSupportRequests,
  updateSupportRequest,
  getUserHistory,
  getAllOrders,
};
