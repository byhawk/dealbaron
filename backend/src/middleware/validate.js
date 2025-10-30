const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Middleware to check validation results from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    throw new AppError('Validation failed', 400, formattedErrors);
  }

  next();
};

/**
 * Middleware to validate UUID parameters
 */
const validateUUID = (paramName) => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(uuid)) {
      throw new AppError(`Invalid ${paramName}`, 400);
    }

    next();
  };
};

/**
 * Middleware to validate pagination parameters
 */
const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (page < 1) {
    throw new AppError('Page must be >= 1', 400);
  }

  if (limit < 1 || limit > 100) {
    throw new AppError('Limit must be between 1 and 100', 400);
  }

  req.pagination = {
    page,
    limit,
    offset: (page - 1) * limit,
  };

  next();
};

/**
 * Middleware to sanitize request body (remove unwanted fields)
 */
const sanitize = (allowedFields) => {
  return (req, res, next) => {
    const sanitized = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        sanitized[field] = req.body[field];
      }
    }

    req.body = sanitized;
    next();
  };
};

module.exports = {
  validate,
  validateUUID,
  validatePagination,
  sanitize,
};
