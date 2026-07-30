/**
 * Centralized error-handling middleware + 404 handler.
 * Every thrown/forwarded error funnels through here to produce a
 * consistent JSON envelope: { success, message, errors }.
 */
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * 404 handler for unmatched routes. Placed after all routes.
 */
const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/**
 * Global error handler. Must have the 4-arg signature for Express to
 * recognize it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // --- Normalize common Mongoose / driver errors ---

  // Duplicate key (unique index violation).
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. It already exists.`;
  }

  // Mongoose validation error.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Invalid ObjectId / cast failure.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Multer file-size error.
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File too large. Maximum allowed size is 5 MB.';
  }

  // Log server-side faults (not client 4xx noise).
  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('💥 Server Error:', err);
  }

  const payload = {
    success: false,
    message,
  };

  if (errors && errors.length > 0) {
    payload.errors = errors;
  }

  // Expose stack traces only outside production for debugging.
  if (env.nodeEnv !== 'production' && !err.isOperational) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

module.exports = { notFound, errorHandler };
