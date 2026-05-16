// -----------------------------------------
// Report Controller
// Generates dashboard stats and summaries
// -----------------------------------------
const Production = require('../models/Production');
const Payment = require('../models/Payment');

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const productionStats = await Production.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: '$quantity' },
          totalProductionCost: { $sum: { $multiply: ['$productionCost', '$quantity'] } },
          totalSellingPrice: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
          entryCount: { $sum: 1 },
        },
      },
    ]);

    const paymentStats = await Payment.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    let totalEarnings = 0;
    let pendingPayments = 0;
    paymentStats.forEach((stat) => {
      if (stat._id === 'received') totalEarnings = stat.totalAmount;
      else if (stat._id === 'pending') pendingPayments = stat.totalAmount;
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyProduction = await Production.aggregate([
      { $match: { userId: userId, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: '$quantity' },
          totalCost: { $sum: { $multiply: ['$productionCost', '$quantity'] } },
          totalRevenue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProducts: productionStats[0]?.totalProducts || 0,
        totalEarnings,
        pendingPayments,
        totalProductionCost: productionStats[0]?.totalProductionCost || 0,
        totalSellingPrice: productionStats[0]?.totalSellingPrice || 0,
        entryCount: productionStats[0]?.entryCount || 0,
        weekly: {
          production: weeklyProduction[0] || { totalProducts: 0, totalCost: 0, totalRevenue: 0 },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get weekly summary
// @route   GET /api/reports/weekly
const getWeeklySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const dailyProduction = await Production.aggregate([
      { $match: { userId: userId, date: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: { $multiply: ['$productionCost', '$quantity'] } },
          totalRevenue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyPayments = await Payment.aggregate([
      { $match: { userId: userId, paymentDate: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$status', 'received'] }, '$amount', 0] },
          },
          totalPending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({ success: true, data: { dailyProduction, dailyPayments } });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly summary
// @route   GET /api/reports/monthly
const getMonthlySummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyProduction = await Production.aggregate([
      { $match: { userId: userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          totalQuantity: { $sum: '$quantity' },
          totalCost: { $sum: { $multiply: ['$productionCost', '$quantity'] } },
          totalRevenue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
          profit: {
            $sum: {
              $subtract: [
                { $multiply: ['$sellingPrice', '$quantity'] },
                { $multiply: ['$productionCost', '$quantity'] },
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyPayments = await Payment.aggregate([
      { $match: { userId: userId, paymentDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          totalReceived: {
            $sum: { $cond: [{ $eq: ['$status', 'received'] }, '$amount', 0] },
          },
          totalPending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Production.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$productName',
          totalQuantity: { $sum: '$quantity' },
          totalRevenue: { $sum: { $multiply: ['$sellingPrice', '$quantity'] } },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: { monthlyProduction, monthlyPayments, topProducts },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getWeeklySummary, getMonthlySummary };
