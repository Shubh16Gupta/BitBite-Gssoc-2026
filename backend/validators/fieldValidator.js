/**
 * express-validator chains for farmer field (plot) endpoints.
 * Each exported array is a list of validation middlewares to spread into a route.
 */
const { body, param } = require('express-validator');

// Reusable :id param check — must be a valid Mongo ObjectId.
const fieldIdParam = param('id')
  .isMongoId()
  .withMessage('Invalid field id');

/**
 * POST /api/farmer/fields
 * All core attributes are required when creating a field.
 */
const createFieldValidator = [
  body('fieldName')
    .trim()
    .notEmpty()
    .withMessage('Field name is required')
    .isLength({ min: 2 })
    .withMessage('Field name must be at least 2 characters'),

  body('cropType').trim().notEmpty().withMessage('Crop type is required'),

  body('area')
    .notEmpty()
    .withMessage('Area is required')
    .isFloat({ gt: 0 })
    .withMessage('Area must be a positive number'),

  body('areaUnit')
    .optional()
    .isIn(['acre', 'hectare'])
    .withMessage('Area unit must be acre or hectare'),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isObject()
    .withMessage('Location must be an object with latitude and longitude'),

  body('location.latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

/**
 * PUT /api/farmer/fields/:id
 * Every field is optional (partial update), but any provided value is validated.
 */
const updateFieldValidator = [
  fieldIdParam,

  body('fieldName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Field name cannot be empty')
    .isLength({ min: 2 })
    .withMessage('Field name must be at least 2 characters'),

  body('cropType').optional().trim().notEmpty().withMessage('Crop type cannot be empty'),

  body('area')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Area must be a positive number'),

  body('areaUnit')
    .optional()
    .isIn(['acre', 'hectare'])
    .withMessage('Area unit must be acre or hectare'),

  body('location')
    .optional()
    .isObject()
    .withMessage('Location must be an object with latitude and longitude'),

  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

/**
 * Routes that only need a valid :id (GET one, DELETE).
 */
const fieldIdValidator = [fieldIdParam];

module.exports = { createFieldValidator, updateFieldValidator, fieldIdValidator };
