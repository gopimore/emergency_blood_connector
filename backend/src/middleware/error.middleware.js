import AppError from '../utils/AppError.js';
import logger from '../config/logger.js';

const handleCastErrorDB = () =>
  new AppError('Resource not found', 404);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  return new AppError(`Duplicate value for ${field}`, 400);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors || {})
    .map((e) => e.message)
    .join('. ');
  return new AppError(message || 'Validation failed', 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  if (err.isOperational && err.statusCode < 500) {
    logger.debug(err.message);
  } else {
    logger.error(err.stack || err.message);
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  logger.error(err.stack || err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
};

// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  const isGeoError =
    err.message?.includes('geo keys') || err.message?.includes('Point must be');

  if (process.env.NODE_ENV === 'development') {
    let error = { ...err, message: err.message, statusCode: err.statusCode };

    if (isGeoError) error = new AppError('Invalid or incomplete location coordinates', 400);
    if (err.name === 'CastError') error = handleCastErrorDB();
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    return sendErrorDev(error, res);
  }

  let error = err;
  if (isGeoError) error = new AppError('Invalid or incomplete location coordinates', 400);
  if (err.name === 'CastError') error = handleCastErrorDB();
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  sendErrorProd(error, res);
};

export const notFound = (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};
