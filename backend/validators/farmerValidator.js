/**
 * express-validator chains for farmer-facing endpoints.
 * Each exported array is a list of validation middlewares to spread into a route.
 */
const { body } = require('express-validator');

// Indian mobile number: 10 digits starting 6-9, optional +91 prefix.
const phoneChain = body('phone')
  .trim()
  .notEmpty()
  .withMessage('Phone number is required')
  .matches(/^(\+91)?[6-9]\d{9}$/)
  .withMessage('Enter a valid 10-digit Indian mobile number');

/**
 * POST /api/farmer/send-otp
 */
const sendOtpValidator = [phoneChain];

/**
 * POST /api/farmer/verify-otp
 */
const verifyOtpValidator = [
  phoneChain,
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must be numeric'),
];

/**
 * POST /api/farmer/signup
 */
const signupValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  phoneChain,

  body('aadhaarNumber')
    .trim()
    .notEmpty()
    .withMessage('Aadhaar number is required')
    .customSanitizer((v) => String(v).replace(/\D/g, ''))
    .isLength({ min: 12, max: 12 })
    .withMessage('Aadhaar number must be 12 digits')
    .isNumeric()
    .withMessage('Aadhaar number must be numeric'),

  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),

  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  body('state').trim().notEmpty().withMessage('State is required'),
  body('district').trim().notEmpty().withMessage('District is required'),
  body('village').trim().notEmpty().withMessage('Village is required'),

  body('landArea')
    .notEmpty()
    .withMessage('Land area is required')
    .isFloat({ gt: 0 })
    .withMessage('Land area must be a positive number'),

  body('landUnit')
    .optional()
    .isIn(['acre', 'hectare', 'bigha', 'guntha'])
    .withMessage('Invalid land unit'),

  body('ownershipType')
    .optional()
    .isIn(['owned', 'leased', 'shared'])
    .withMessage('Invalid ownership type'),

  body('primaryCrop').trim().notEmpty().withMessage('Primary crop is required'),

  body('irrigationType')
    .optional()
    .isIn(['rainfed', 'canal', 'borewell', 'drip', 'sprinkler', 'other'])
    .withMessage('Invalid irrigation type'),
];

module.exports = { sendOtpValidator, verifyOtpValidator, signupValidator };
