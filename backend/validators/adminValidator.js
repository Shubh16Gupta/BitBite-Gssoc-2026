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
    // Lowercase only — deliberately NOT normalizeEmail(). That sanitizer strips
    // dots and +tags from Gmail addresses, so seeding `a.b@gmail.com` and then
    // typing the same address at login would look up `ab@gmail.com` and fail
    // with "Invalid email or password". The seed script stores what you give it
    // (lowercased by the schema), so login must match that exactly.
    .customSanitizer((value) => String(value).trim().toLowerCase()),

  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Shared :id param validator for bank status routes.
 */
const bankIdValidator = [
  param('id').isMongoId().withMessage('Invalid bank id'),
];

module.exports = { loginValidator, bankIdValidator };
