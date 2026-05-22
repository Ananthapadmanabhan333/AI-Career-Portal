/**
 * Premium Custom Logger Middleware (Task 8 and general telemetry requirement)
 * Beautifully formats and outputs terminal telemetry for all active HTTP transactions.
 */

const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Intercept the response finish event to capture processing times
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // Harmonious styling color codes for terminal logging
    let statusColor = '\x1b[32m'; // Green
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = '\x1b[33m'; // Yellow (Client Errors)
    } else if (statusCode >= 500) {
      statusColor = '\x1b[31m'; // Red (Server Errors)
    }

    const resetColor = '\x1b[0m';
    const timestamp = new Date().toISOString();

    console.log(
      `[${timestamp}] ${method} ${originalUrl} - ${statusColor}${statusCode}${resetColor} - ${duration}ms (IP: ${ip})`
    );
  });

  next();
};

module.exports = loggerMiddleware;
