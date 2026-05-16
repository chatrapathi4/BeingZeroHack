// -----------------------------------------
// AI Controller
// Product image analyzer with Gemini/OpenAI/Template fallback
// -----------------------------------------
const path = require('path');
const { analyzeProductImage } = require('../services/aiService');

// @desc    Analyze uploaded product image
// @route   POST /api/ai/analyze
// @access  Private
const analyzeProduct = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a product image for analysis.',
      });
    }

    const imagePath = path.join(__dirname, '../uploads', req.file.filename);
    const analysis = await analyzeProductImage(imagePath, req.file.filename);

    res.status(200).json({
      success: true,
      message: 'Product analysis completed successfully.',
      data: {
        ...analysis,
        analyzedAt: new Date().toISOString(),
        imageFile: req.file.filename,
        imageUrl: `/uploads/${req.file.filename}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeProduct };
