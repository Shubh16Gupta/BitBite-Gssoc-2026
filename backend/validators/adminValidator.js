/**
 * express-validator chains for admin endpoints.
 */
const { body, param } = require('express-validator');

/**
 * POST /api/admin/login
 */
const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Shared :id param validator for bank status routes.
 */
const bankIdValidator = [
  param('id').isMongoId().withMessage('Invalid bank id'),
];

module.exports = { loginValidator, bankIdValidator };
