// -----------------------------------------
// Auth Controller
// Handles user registration, login, Google OAuth,
// and profile management
// -----------------------------------------
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
    });

    // Generate token and respond
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with email and password
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if user registered with Google (no password set)
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google login. Please sign in with Google.',
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate token and respond
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = async (req, res, next) => {
  try {
    // req.user is set by Passport after successful Google auth
    const token = generateToken(req.user);

    // Redirect to frontend with token as query parameter
    const frontendURL = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(`${frontendURL}/auth/google/callback?token=${token}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Google login from frontend (token-based)
// @route   POST /api/auth/google/login
// @access  Public
const googleLogin = async (req, res, next) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Google authentication data is incomplete.',
      });
    }

    // Find or create user
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // Update Google info if not already set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || '',
        role: 'user',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  googleLogin,
  getProfile,
  updateProfile,
};
