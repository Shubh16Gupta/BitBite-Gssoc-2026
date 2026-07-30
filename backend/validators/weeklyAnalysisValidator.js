/**
 * express-validator chains for the Weekly Crop Analysis endpoints.
 *
 * Note: the uploaded images (count/type/size) are validated in the controller
 * and Multer middleware, since express-validator operates on body fields, not
 * on `req.files`.
 */
const { body, param, query } = require('express-validator');

const weekNumberRule = (chain) =>
  chain
    .notEmpty()
    .withMessage('Week number is required')
    .bail()
    .isInt({ min: 1, max: 53 })
    .withMessage('Week number must be an integer between 1 and 53')
    .toInt();

/**
 * POST /api/farmer/weekly-analysis
 * Multipart form: fieldId, weekNumber, images[] (3–5 files).
 */
const createWeeklyAnalysisValidator = [
  body('fieldId')
    .notEmpty()
    .withMessage('Field ID is required')
    .bail()
    .isMongoId()
    .withMessage('Invalid field id'),

  weekNumberRule(body('weekNumber')),
];

/**
 * GET /api/farmer/weekly-analysis (optional filters)
 */
const listWeeklyAnalysisValidator = [
  query('fieldId').optional().isMongoId().withMessage('Invalid field id'),
  query('weekNumber')
    .optional()
    .isInt({ min: 1, max: 53 })
    .withMessage('Week number must be an integer between 1 and 53')
    .toInt(),
];

/**
 * Routes with an :id param (GET one).
 */
const analysisIdValidator = [param('id').isMongoId().withMessage('Invalid analysis id')];

module.exports = {
  createWeeklyAnalysisValidator,
  listWeeklyAnalysisValidator,
  analysisIdValidator,
};
