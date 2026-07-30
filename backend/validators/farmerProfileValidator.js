/**
 * express-validator chains for the farmer profile endpoints.
 *
 * Profile updates are partial: every field is optional, but any provided value
 * is validated. Phone and Aadhaar are deliberately absent — they are managed by
 * the authentication flow and cannot be changed here.
 */
const { body } = require('express-validator');

/**
 * PUT /api/farmer/profile
 */
const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('landArea')
    .optional()
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

  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  body('village').optional().trim().notEmpty().withMessage('Village cannot be empty'),
];

module.exports = { updateProfileValidator };
