// src/middleware/errorHandler.js

/**
 * Handle favicon requests silently
 */
export const ignoreFavicon = (req, res, next) => {
  if (req.originalUrl === '/favicon.ico') {
    return res.status(204).end();
  }
  next();
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Suppress favicon errors in console
  if (req.originalUrl === '/favicon.ico') {
    return res.status(204).end();
  }

  console.error('Error:', err.message);
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Handle 404 Not Found
 */
export const notFound = (req, res, next) => {
  // Silently handle favicon requests
  if (req.originalUrl === '/favicon.ico') {
    return res.status(204).end();
  }
  
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};