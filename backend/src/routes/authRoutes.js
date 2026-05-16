// -----------------------------------------
// Auth Routes
// Public: register, login, Google OAuth
// Private: profile management
// -----------------------------------------
const express = require('express');
const router = express.Router();
const passport = require('passport');
const auth = require('../middleware/auth');
const {
  register,
  login,
  googleCallback,
  googleLogin,
  getProfile,
  updateProfile,
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google/login', googleLogin);

// Google OAuth routes (Passport)
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

// Private routes (require JWT token)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);

module.exports = router;
