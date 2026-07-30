/**
 * express-validator chains for bank-facing endpoints.
 */
const { body, query, param } = require('express-validator');

/**
 * POST /api/bank/signup
 */
const signupValidator = [
  body('institutionType')
    .notEmpty()
    .withMessage('Institution type is required')
    .isIn(['Public Sector Bank', 'Private Bank', 'Cooperative Bank', 'RRB', 'NBFC', 'Other'])
    .withMessage('Invalid institution type'),

  body('institutionName').trim().notEmpty().withMessage('Institution name is required'),
  body('branchName').trim().notEmpty().withMessage('Branch name is required'),
  body('branchAddress').trim().notEmpty().withMessage('Branch address is required'),

  // Standard IFSC format: 4 letters + 0 + 6 alphanumerics.
  body('IFSC')
    .trim()
    .notEmpty()
    .withMessage('IFSC code is required')
    .matches(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)
    .withMessage('Enter a valid IFSC code (e.g. HDFC0001234)'),

  body('officialEmail')
    .trim()
    .notEmpty()
    .withMessage('Official email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('employeeId').trim().notEmpty().withMessage('Employee ID is required'),
  body('designation').trim().notEmpty().withMessage('Designation is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

/**
 * POST /api/bank/login
 */
const loginValidator = [
  body('officialEmail')
    .trim()
    .notEmpty()
    .withMessage('Official email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .normalizeEmail(),

  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * PUT /api/bank/criteria
 */
const setCriteriaValidator = [
  body('minAnnScore')
    .notEmpty()
    .withMessage('Threshold AnnScore is required')
    .bail()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Threshold AnnScore must be between 0 and 100')
    .toFloat(),
];

/**
 * GET /api/bank/eligible-farmers | /api/bank/dashboard (optional override)
 */
const thresholdQueryValidator = [
  query('minAnnScore')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('minAnnScore must be between 0 and 100')
    .toFloat(),
];

/**
 * GET /api/bank/farmers/:farmerId/report
 */
const farmerIdParamValidator = [param('farmerId').isMongoId().withMessage('Invalid farmer id')];

module.exports = {
  signupValidator,
  loginValidator,
  setCriteriaValidator,
  thresholdQueryValidator,
  farmerIdParamValidator,
};
