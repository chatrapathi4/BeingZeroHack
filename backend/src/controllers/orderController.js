const Order = require('../models/Order');
const Production = require('../models/Production');
const Payment = require('../models/Payment');

// Helper: auto-create production entry when work is completed
const autoCreateProduction = async (order) => {
  if (order.workStatus === 'completed' && !order.productionEntryCreated) {
    const production = await Production.create({
      userId: order.userId,
      productName: order.productName,
      quantity: order.quantity,
      materialsUsed: order.materialsUsed || '',
      productionCost: order.productCost,
      sellingPrice: order.sellingPrice,
      notes: order.notes ? `[Auto] Order for ${order.customerName} - ${order.notes}` : `[Auto] Order for ${order.customerName}`,
      date: order.date,
    });
    order.productionEntryCreated = true;
    order.linkedProductionId = production._id;
    await order.save();
  }
};

// Helper: auto-create payment entry when payment is completed
const autoCreatePayment = async (order) => {
  if (order.paymentStatus === 'completed' && !order.paymentEntryCreated) {
    const payment = await Payment.create({
      userId: order.userId,
      customerName: order.customerName,
      amount: order.sellingPrice * order.quantity,
      status: 'received',
      paymentDate: new Date(),
      notes: order.notes ? `[Auto] Order: ${order.productName} - ${order.notes}` : `[Auto] Order: ${order.productName}`,
    });
    order.paymentEntryCreated = true;
    order.linkedPaymentId = payment._id;
    await order.save();
  }
};

// @desc    Get all orders for current user
// @route   GET /api/orders
const getAll = async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
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

// @desc    Get single order
// @route   GET /api/orders/:id
const getById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new order
// @route   POST /api/orders
const create = async (req, res, next) => {
  try {
    const { customerName, productName, quantity, sellingPrice, productCost, date, materialsUsed, notes, workStatus, paymentStatus } = req.body;

    if (!customerName || !productName || !quantity || sellingPrice === undefined || productCost === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide customer name, product name, quantity, selling price, and product cost.',
      });
    }

    const order = await Order.create({
      userId: req.user._id,
      customerName,
      productName,
      quantity,
      sellingPrice,
      productCost,
      date: date || Date.now(),
      materialsUsed: materialsUsed || '',
      notes: notes || '',
      workStatus: workStatus || 'pending',
      paymentStatus: paymentStatus || 'pending',
    });

    // Auto-create entries if statuses are already completed on creation
    await autoCreateProduction(order);
    await autoCreatePayment(order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
const update = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Update allowed fields
    const allowedFields = ['customerName', 'productName', 'quantity', 'sellingPrice', 'productCost', 'date', 'materialsUsed', 'notes', 'workStatus', 'paymentStatus'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        order[field] = req.body[field];
      }
    });

    await order.save();

    // Auto-create entries if status changed to completed
    await autoCreateProduction(order);
    await autoCreatePayment(order);

    res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
const remove = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
