import logger from '../utils/logger.js';

/**
 * Enhanced global error handler middleware
 * Handles various types of errors and provides consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  logger.error('Error occurred:', {
    name: err.name,
    message: err.message,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Log full stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    logger.error(err.stack);
  }

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = err.kind === 'ObjectId'
      ? 'Invalid ID format'
      : `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists. Please use a different value.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    message = 'Validation failed';
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // Multer File Upload Errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File is too large. Maximum size is 10MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files uploaded.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field.';
        break;
      default:
        message = 'File upload error: ' + err.message;
    }
  }

  // MongoDB Connection Errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongooseServerSelectionError') {
    statusCode = 503;
    message = 'Database connection error. Please try again later.';
  }

  // Syntax Errors (malformed JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON format in request body.';
  }

  // Custom Application Errors
  if (err.isOperational) {
    statusCode = err.statusCode || 400;
    message = err.message;
  }

  // Build error response
  const errorResponse = {
    success: false,
    message,
    statusCode
  };

  // Add validation errors if present
  if (errors && errors.length > 0) {
    errorResponse.errors = errors;
  }

  // Add error code for client-side handling
  if (err.code) {
    errorResponse.errorCode = err.code;
  }

  // Include stack trace in development mode
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.stack = err.stack;
    errorResponse.errorDetails = {
      name: err.name,
      path: req.path,
      method: req.method
    };
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Custom error class for operational errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Async error wrapper to catch errors in async route handlers
 * Usage: asyncHandler(async (req, res, next) => { ... })
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
