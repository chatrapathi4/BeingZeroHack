// -----------------------------------------
// Production Controller
// CRUD operations for production entries
// Each user can only manage their own entries
// -----------------------------------------
const Production = require('../models/Production');

// @desc    Get all production entries for current user
// @route   GET /api/production
// @access  Private
const getAll = async (req, res, next) => {
  try {
    const productions = await Production.find({ userId: req.user._id })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: productions.length,
      data: productions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single production entry
// @route   GET /api/production/:id
// @access  Private
const getById = async (req, res, next) => {
  try {
    const production = await Production.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!production) {
      return res.status(404).json({
        success: false,
        message: 'Production entry not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: production,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new production entry
// @route   POST /api/production
// @access  Private
const create = async (req, res, next) => {
  try {
    const { productName, quantity, materialsUsed, productionCost, sellingPrice, notes, date } = req.body;

    // Validate required fields
    if (!productName || !quantity || productionCost === undefined || sellingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide product name, quantity, production cost, and selling price.',
      });
    }

    const production = await Production.create({
      userId: req.user._id,
      productName,
      quantity,
      materialsUsed: materialsUsed || '',
      productionCost,
      sellingPrice,
      notes: notes || '',
      date: date || Date.now(),
    });

    res.status(201).json({
      success: true,
      message: 'Production entry created successfully.',
      data: production,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update production entry
// @route   PUT /api/production/:id
// @access  Private
const update = async (req, res, next) => {
  try {
    let production = await Production.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!production) {
      return res.status(404).json({
        success: false,
        message: 'Production entry not found.',
      });
    }

    // Update with provided fields
    production = await Production.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Production entry updated successfully.',
      data: production,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete production entry
// @route   DELETE /api/production/:id
// @access  Private
const remove = async (req, res, next) => {
  try {
    const production = await Production.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!production) {
      return res.status(404).json({
        success: false,
        message: 'Production entry not found.',
      });
    }

    await Production.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Production entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, create, update, remove };
