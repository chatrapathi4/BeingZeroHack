// -----------------------------------------
// Report Routes
// All routes are protected (require authentication)
// -----------------------------------------
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getDashboardStats,
  getWeeklySummary,
  getMonthlySummary,
} = require('../controllers/reportController');

router.use(auth);

router.get('/dashboard', getDashboardStats);
router.get('/weekly', getWeeklySummary);
router.get('/monthly', getMonthlySummary);

module.exports = router;
