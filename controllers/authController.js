const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ai_career_portal_key_2026';

// Helper: Signs JWT Token
const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: '24h' // Persistent for 24 hours
  });
};

// Helper: Sets HttpOnly cookie
const sendTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    httpOnly: true, // Safeguard against XSS injections
    secure: process.env.NODE_ENV === 'production' // Only send over HTTPS in production
  };

  res.cookie('token', token, cookieOptions);
};

/**
 * Handle Registration POST requests
 */
const register = async (req, res, next) => {
  const { username, email, password, role, bio, skills } = req.body;

  try {
    // Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.render('register', {
        errors: ['Email address is already registered'],
        prevInput: req.body
      });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.render('register', {
        errors: ['Username is already taken'],
        prevInput: req.body
      });
    }

    // Convert comma separated skills into array
    const parsedSkills = skills 
      ? skills.split(',').map(s => s.trim()).filter(s => s.length > 0) 
      : [];

    // Create new user (Pre-save hook in model will hash password)
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'Job Seeker',
      bio: bio || '',
      skills: parsedSkills
    });

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    // Redirect to dashboard upon successful signup
    res.redirect('/dashboard');
  } catch (error) {
    console.error(`[Auth Register Error] ${error.message}`);
    next(error);
  }
};

/**
 * Handle Login POST requests
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', {
        errors: ['Invalid credentials. Email not found.'],
        prevInput: req.body
      });
    }

    // Match password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('login', {
        errors: ['Invalid credentials. Incorrect password.'],
        prevInput: req.body
      });
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error(`[Auth Login Error] ${error.message}`);
    next(error);
  }
};

/**
 * Handle Logout request
 */
const logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/login?message=Logged%20out%20successfully');
};

module.exports = {
  register,
  login,
  logout
};
