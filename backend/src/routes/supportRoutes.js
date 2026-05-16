// -----------------------------------------
// Support Routes (User-side)
// All routes are protected (require authentication)
// -----------------------------------------
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserRequests,
  createRequest,
  getRequestById,
} = require('../controllers/supportController');

router.use(auth);

router.route('/').get(getUserRequests).post(createRequest);
router.route('/:id').get(getRequestById);

module.exports = router;
