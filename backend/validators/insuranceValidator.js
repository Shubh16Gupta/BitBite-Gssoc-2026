/**
 * express-validator chains for insurer auth + insurance endpoints.
 */
const { body, param, query } = require('express-validator');

const signupValidator = [
  body('insurerType')
    .notEmpty()
    .withMessage('Insurer type is required')
    .isIn(['General Insurer', 'Agri Insurer', 'Government Scheme', 'Cooperative', 'Other'])
    .withMessage('Invalid insurer type'),

  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('branchName').trim().notEmpty().withMessage('Branch name is required'),
  body('branchAddress').trim().notEmpty().withMessage('Branch address is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),

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

/** POST /api/farmer/insurance/apply */
const applyValidator = [
  body('cycleId')
    .notEmpty()
    .withMessage('Crop cycle is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid crop cycle id'),
];

/** PUT /api/insurer/criteria */
const setCriteriaValidator = [
  body('minAnnScore')
    .notEmpty()
    .withMessage('Threshold AnnScore is required')
    .bail()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Threshold AnnScore must be between 0 and 100')
    .toFloat(),
];

const statusQueryValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be pending, approved or rejected'),
];

const cycleIdParamValidator = [param('cycleId').isMongoId().withMessage('Invalid crop cycle id')];
const applicationIdValidator = [param('id').isMongoId().withMessage('Invalid application id')];
const farmerIdParamValidator = [param('farmerId').isMongoId().withMessage('Invalid farmer id')];

module.exports = {
  signupValidator,
  loginValidator,
  applyValidator,
  setCriteriaValidator,
  statusQueryValidator,
  cycleIdParamValidator,
  applicationIdValidator,
  farmerIdParamValidator,
};
