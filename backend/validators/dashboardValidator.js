/**
 * express-validator chains for the farmer dashboard endpoints.
 */
const { param } = require('express-validator');

/**
 * Routes with a :fieldId param (dashboard, history).
 */
const fieldIdParamValidator = [param('fieldId').isMongoId().withMessage('Invalid field id')];

module.exports = { fieldIdParamValidator };
