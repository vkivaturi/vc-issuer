class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Wrapper for async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode
  });

  // Default error status and code
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific types of errors
  if (err.code === 'ER_NO_SUCH_TABLE') {
    err.statusCode = 500;
    err.message = 'Database table not found';
  } else if (err.code === 'ER_BAD_FIELD_ERROR') {
    err.statusCode = 500;
    err.message = 'Invalid database query';
  } else if (err.code === 'ECONNREFUSED') {
    err.statusCode = 500;
    err.message = 'Database connection failed';
  }

  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  ApiError,
  asyncHandler,
  errorHandler
}; 