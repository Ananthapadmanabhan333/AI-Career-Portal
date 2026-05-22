const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const webRoutes = require('./routes/webRoutes');
const apiRoutes = require('./routes/apiRoutes');
const { seedMockJobs } = require('./utils/mockData');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Database
connectDB().then(() => {
  // Pre-seed mock data immediately if database is empty
  seedMockJobs();
});

// Configure EJS Template Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Apply Static Assets Folder
app.use(express.static(path.join(__dirname, 'public')));

/* ====================================================
   GLOBAL SECURITY & OPTIMIZATION MIDDLEWARES (Task 8)
   ==================================================== */

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie Parser Middleware for JWT secure cookies
app.use(cookieParser());

// Custom Structured Console Logger
app.use(loggerMiddleware);

// Rate Limiting protection to prevent brute force on authentication (Task 7/8 security)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests generated from this IP. Please try again after 15 minutes.'
  }
});

// Apply rate limiting selectively to login, registration, and file analysis endpoints
app.use('/routes/register', authLimiter);
app.use('/routes/login', authLimiter);
app.use('/api/applications', authLimiter);

/* ====================================================
   ROUTING LAYER DEFINITIONS
   ==================================================== */

// Bind UI Page Router
app.use('/', webRoutes);

// Bind JSON REST resources Router
app.use('/api', apiRoutes);

/* ====================================================
   ERROR INTERCEPTIONS LAYER
   ==================================================== */

// Centralized express error handler
app.use(errorMiddleware);

// Uncaught exceptions catch
app.use((req, res, next) => {
  res.status(404).render('index', {
    page: 'error',
    user: req.user || null,
    error: {
      status: 404,
      message: 'Page Not Found',
      details: `The requested path [ ${req.originalUrl} ] could not be resolved on our server.`
    }
  });
});

// Boot listening server
app.listen(PORT, () => {
  console.log(`\n====================================================`);
  console.log(`  AI Career Portal Server Active`);
  console.log(`  Access URL: \x1b[36mhttp://localhost:${PORT}\x1b[0m`);
  console.log(`  Environment Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================\n`);
});

module.exports = app; // Export for testing/CI environments
