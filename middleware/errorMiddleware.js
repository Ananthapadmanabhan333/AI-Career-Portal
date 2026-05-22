/**
 * Centralized Global Error Handler Middleware
 * Intercepts uncaught routing exceptions and formats responses cleanly:
 * - Emits beautiful JSON details for API requests.
 * - Renders a professional error visualizer for standard browser interactions.
 */

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred';
  const environment = process.env.NODE_ENV || 'development';

  console.error(`[Error Handler] Caught exception: ${message}`);
  if (err.stack && environment === 'development') {
    console.error(err.stack);
  }

  // Determine whether to send JSON or render EJS page
  const isAPI = req.originalUrl.startsWith('/api/') || req.headers.accept?.includes('application/json');

  if (isAPI) {
    return res.status(statusCode).json({
      success: false,
      error: message,
      stack: environment === 'development' ? err.stack : undefined
    });
  }

  // Server-side HTML render of errors
  res.status(statusCode).render('index', {
    page: 'error',
    user: req.user || null,
    error: {
      status: statusCode,
      message: message,
      details: environment === 'development' ? err.stack : 'Please try again later or contact portal support.'
    }
  });
};

module.exports = errorMiddleware;
