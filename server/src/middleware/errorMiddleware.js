import { env } from '#config/env';

// Centralized error handler. Never leaks stack traces to the client.
const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = Array.isArray(err.errors) ? err.errors : [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${field} already exists`;
    errors = [`Duplicate value for ${field}`];
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid identifier supplied';
  }

  if (req.log) {
    if (statusCode >= 500) {
      req.log.error({ err, statusCode }, message);
    } else {
      // Expected client errors (bad input, missing/expired auth, 404s, etc.)
      // don't need a full stack trace — that noise makes real bugs harder to spot.
      req.log.warn({ statusCode, message }, message);
    }
  } else if (env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorMiddleware;
