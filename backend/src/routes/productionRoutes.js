// -----------------------------------------
// Production Routes
// All routes are protected (require authentication)
// -----------------------------------------
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAll,
  getById,
  create,
  update,
  remove,
} = require('../controllers/productionController');

router.use(auth); // Apply auth middleware to all routes

router.route('/').get(getAll).post(create);
router.route('/:id').get(getById).put(update).delete(remove);

module.exports = router;
