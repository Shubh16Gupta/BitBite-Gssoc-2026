/**
 * express-validator chains for the crop-cycle endpoints.
 * (Uploaded phase images are validated in the controller, since express-validator
 * operates on body fields, not req.files.)
 */
const { body, param } = require('express-validator');

/**
 * POST /api/farmer/crop-cycles
 */
const startCycleValidator = [
  body('fieldId').notEmpty().withMessage('Field ID is required').bail().isMongoId().withMessage('Invalid field id'),

  body('cropType').trim().notEmpty().withMessage('Crop type is required'),

  body('sowingDate')
    .notEmpty()
    .withMessage('Sowing date is required')
    .bail()
    .isISO8601()
    .withMessage('Sowing date must be a valid date (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) > new Date()) throw new Error('Sowing date cannot be in the future');
      return true;
    }),

  body('farmSize').optional().isFloat({ gt: 0 }).withMessage('Farm size must be a positive number'),
];

/**
 * POST /api/farmer/crop-cycles/:cycleId/phases
 */
const submitPhaseValidator = [
  param('cycleId').isMongoId().withMessage('Invalid crop cycle id'),

  body('phaseNumber')
    .notEmpty()
    .withMessage('Phase number is required')
    .bail()
    .isInt({ min: 1, max: 4 })
    .withMessage('Phase number must be between 1 and 4')
    .toInt(),
  // Note: diseaseSeverity is NOT accepted as input — it is derived from the
  // crop-health score in cropCycleService and returned as an output.
];

/**
 * Routes with a :cycleId param.
 */
const cycleIdValidator = [param('cycleId').isMongoId().withMessage('Invalid crop cycle id')];

module.exports = { startCycleValidator, submitPhaseValidator, cycleIdValidator };
