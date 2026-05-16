// -----------------------------------------
// Admin Routes
// All routes require admin role
// -----------------------------------------
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  getAllUsers,
  deleteUser,
  getAnalytics,
  getAllProduction,
  getAllSupportRequests,
  updateSupportRequest,
  getUserHistory,
} = require('../controllers/adminController');

// Apply both auth and admin middleware
router.use(auth);
router.use(admin);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/history', getUserHistory);
router.get('/analytics', getAnalytics);
router.get('/production', getAllProduction);
router.get('/support', getAllSupportRequests);
router.put('/support/:id', updateSupportRequest);

module.exports = router;
