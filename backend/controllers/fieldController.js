/**
 * Field controller.
 * CRUD for a farmer's fields (plots). Every handler runs behind `verifyFarmer`,
 * so `req.farmer` is guaranteed and all operations are scoped to that farmer.
 * Data access lives in services/fieldService.js — controllers just orchestrate.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const fieldService = require('../services/fieldService');

/**
 * @route   POST /api/farmer/fields
 * @desc    Create a new field for the authenticated farmer.
 * @access  Private (farmer)
 */
const createField = asyncHandler(async (req, res) => {
  const field = await fieldService.createField(req.farmer._id, req.body);
  return sendResponse(res, 201, 'Field created successfully.', { field });
});

/**
 * @route   GET /api/farmer/fields
 * @desc    List all fields owned by the authenticated farmer.
 * @access  Private (farmer)
 */
const getFields = asyncHandler(async (req, res) => {
  const fields = await fieldService.listFields(req.farmer._id);
  return sendResponse(res, 200, 'Fields fetched successfully.', {
    count: fields.length,
    fields,
  });
});

/**
 * @route   GET /api/farmer/fields/:id
 * @desc    Fetch a single field owned by the authenticated farmer.
 * @access  Private (farmer)
 */
const getField = asyncHandler(async (req, res) => {
  const field = await fieldService.getFieldById(req.farmer._id, req.params.id);
  if (!field) {
    throw ApiError.notFound('Field not found.');
  }
  return sendResponse(res, 200, 'Field fetched successfully.', { field });
});

/**
 * @route   PUT /api/farmer/fields/:id
 * @desc    Update a field owned by the authenticated farmer.
 * @access  Private (farmer)
 */
const updateField = asyncHandler(async (req, res) => {
  const field = await fieldService.updateField(req.farmer._id, req.params.id, req.body);
  if (!field) {
    throw ApiError.notFound('Field not found.');
  }
  return sendResponse(res, 200, 'Field updated successfully.', { field });
});

/**
 * @route   DELETE /api/farmer/fields/:id
 * @desc    Delete a field owned by the authenticated farmer.
 * @access  Private (farmer)
 */
const deleteField = asyncHandler(async (req, res) => {
  const field = await fieldService.deleteField(req.farmer._id, req.params.id);
  if (!field) {
    throw ApiError.notFound('Field not found.');
  }
  return sendResponse(res, 200, 'Field deleted successfully.', { id: field._id });
});

module.exports = { createField, getFields, getField, updateField, deleteField };
