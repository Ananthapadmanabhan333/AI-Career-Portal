const { body, validationResult } = require('express-validator');

// Validation rules for User Registration
const registerValidationRules = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[A-Za-z0-9_]+$/)
    .withMessage('Username can only contain alphanumeric characters and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for User Login
const loginValidationRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid registered email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Interceptor middleware that collects errors and returns standard payloads
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Extract message list
  const errorMessages = errors.array().map(err => err.msg);

  // Check if API endpoint or standard form post
  const isAPI = req.originalUrl.startsWith('/api/');
  if (isAPI) {
    return res.status(400).json({ success: false, errors: errorMessages });
  }

  // For EJS forms, flash errors back to session or render directly
  req.flashErrors = errorMessages;
  
  // Directly pass to rendering routes by storing in res.locals
  res.locals.errors = errorMessages;
  
  // Render the origin page with the error list
  const routeOrigin = req.originalUrl.includes('register') ? 'register' : 'login';
  return res.render(routeOrigin, {
    errors: errorMessages,
    prevInput: req.body
  });
};

module.exports = {
  registerValidationRules,
  loginValidationRules,
  validate
};
