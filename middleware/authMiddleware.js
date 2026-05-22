const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ai_career_portal_key_2026';

/**
 * Protects web routing panels and parses JWT securely.
 * If authentication fails, redirects standard browser to /login.
 */
const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    // Check Authorization header for REST clients
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
  }

  if (!token) {
    return handleAuthFailure(req, res, 'Not authorized, login required');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch user details and exclude password field
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return handleAuthFailure(req, res, 'User record no longer exists');
    }

    // Attach user information to request object
    req.user = user;
    res.locals.user = user; // Make user details available to EJS views
    next();
  } catch (error) {
    console.error(`[Auth Middleware Error] Verification failed: ${error.message}`);
    return handleAuthFailure(req, res, 'Session expired, please re-authenticate');
  }
};

/**
 * Optional middleware to check auth state without enforcing it.
 * Populates req.user if token is present, but proceeds regardless.
 */
const checkAuthState = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
      res.locals.user = user;
    } else {
      res.locals.user = null;
    }
  } catch (error) {
    res.locals.user = null;
  }
  next();
};

/**
 * Role authorization guard. Assures access is limited to specified roles.
 * @param {...string} roles - Permitted role values (e.g. 'Recruiter', 'Admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const isAPI = req.originalUrl.startsWith('/api/') || req.headers.accept?.includes('application/json');
      if (isAPI) {
        return res.status(403).json({
          success: false,
          error: `Forbidden. Requires one of the roles: [${roles.join(', ')}]`
        });
      }
      return res.status(403).render('index', {
        page: 'error',
        user: req.user || null,
        error: {
          status: 403,
          message: 'Access Denied',
          details: 'You do not hold the required privileges to view this control panel.'
        }
      });
    }
    next();
  };
};

function handleAuthFailure(req, res, reason) {
  const isAPI = req.originalUrl.startsWith('/api/') || req.headers.accept?.includes('application/json');
  if (isAPI) {
    return res.status(401).json({ success: false, error: reason });
  }
  
  // Clean expired cookies
  res.clearCookie('token');
  res.redirect(`/login?error=${encodeURIComponent(reason)}`);
}

module.exports = {
  protect,
  checkAuthState,
  requireRole
};
