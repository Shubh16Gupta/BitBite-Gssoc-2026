/**
 * express-validator chains for loan endpoints.
 * Note: there is no tenure — repayment is harvest-linked, not monthly.
 */
const { body, param, query } = require('express-validator');

const applyValidator = [
  body('bankId')
    .notEmpty()
    .withMessage('Please select a bank')
    .bail()
    .isMongoId()
    .withMessage('Invalid bank selected'),

  body('amount')
    .notEmpty()
    .withMessage('Loan amount is required')
    .bail()
    .isFloat({ gt: 0 })
    .withMessage('Loan amount must be a positive number')
    .toFloat(),

  body('cropType').trim().notEmpty().withMessage('Crop type is required'),

  body('landArea')
    .optional({ values: 'falsy' })
    .isFloat({ gt: 0 })
    .withMessage('Land area must be a positive number')
    .toFloat(),

  body('purpose').optional({ values: 'falsy' }).trim(),
  body('existingLoans').optional({ values: 'falsy' }).trim(),
];

const statusQueryValidator = [
  query('status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be pending, approved or rejected'),
];

const loanIdValidator = [param('id').isMongoId().withMessage('Invalid loan id')];

module.exports = { applyValidator, statusQueryValidator, loanIdValidator };
