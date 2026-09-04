const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error.';

  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'The supplied identifier is invalid.';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors)
      .map((entry) => entry.message)
      .join(' ');
  } else if (error.code === 11000) {
    statusCode = 409;
    message = 'A record with those details already exists.';
  }

  const body = { message };
  if (error.details) body.details = error.details;
  if (process.env.NODE_ENV !== 'production') body.stack = error.stack;

  res.status(statusCode).json(body);
};

module.exports = { errorHandler, notFound };
