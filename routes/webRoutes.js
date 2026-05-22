const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validation');
const { protect, checkAuthState } = require('../middleware/authMiddleware');
const Job = require('../models/Job');
const Application = require('../models/Application');

// Check authentication state for all public screens
router.use(checkAuthState);

/**
 * GET / - Landing Page
 */
router.get('/', (req, res) => {
  res.render('index', { page: 'landing' });
});

/**
 * GET /login - Login Form Screen
 */
router.get('/login', (req, res) => {
  // If already authenticated, bypass login screen
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { errors: null, prevInput: {} });
});

/**
 * GET /register - Signup Form Screen
 */
router.get('/register', (req, res) => {
  if (req.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', { errors: null, prevInput: {} });
});

/**
 * POST /register - Form submission action
 */
router.post('/register', registerValidationRules, validate, authController.register);

/**
 * POST /login - Form submission action
 */
router.post('/login', loginValidationRules, validate, authController.login);

/**
 * GET /logout - Session termination action
 */
router.get('/logout', authController.logout);

/**
 * GET /dashboard - Premium Dashboard Interface (Protected route)
 */
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    // Populate dashboard with initial views data
    const jobs = await Job.find({}).sort({ createdAt: -1 }).limit(10);
    const applications = await Application.find({ user: req.user._id })
      .populate('job')
      .sort({ appliedAt: -1 });

    res.render('dashboard', {
      page: 'dashboard',
      user: req.user,
      jobs,
      applications
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
