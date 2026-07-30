/**
 * Field routes: /api/farmer/fields/*
 *
 * Every route is guarded by `verifyFarmer`, so only an authenticated farmer can
 * reach them, and each handler operates strictly on that farmer's own fields.
 * Flow per route: auth -> validation chains -> validate -> controller.
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const { verifyFarmer } = require('../middleware/authMiddleware');
const {
  createFieldValidator,
  updateFieldValidator,
  fieldIdValidator,
} = require('../validators/fieldValidator');
const {
  createField,
  getFields,
  getField,
  updateField,
  deleteField,
} = require('../controllers/fieldController');

// All field routes require an authenticated farmer.
router.use(verifyFarmer);

router
  .route('/')
  .get(getFields)
  .post(createFieldValidator, validate, createField);

router
  .route('/:id')
  .get(fieldIdValidator, validate, getField)
  .put(updateFieldValidator, validate, updateField)
  .delete(fieldIdValidator, validate, deleteField);

module.exports = router;
