// -----------------------------------------
// AI Routes
// Product image analysis endpoint
// -----------------------------------------
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { analyzeProduct } = require('../controllers/aiController');

router.post('/analyze', auth, upload.single('image'), analyzeProduct);

module.exports = router;
