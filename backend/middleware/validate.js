/**
 * express-validator result collector.
 *
 * Runs after a list of validation chains and converts any accumulated
 * errors into a single 400 ApiError with a normalized `errors` array.
 * Keeps every controller free of validation boilerplate.
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  return next(new ApiError(400, 'Validation failed', errors));
};

module.exports = validate;
