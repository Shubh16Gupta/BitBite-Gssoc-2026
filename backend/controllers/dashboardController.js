/**
 * Dashboard controller.
 *
 * Read-only summary + history endpoints for a farmer's field. Runs behind
 * `verifyFarmer`; each handler first confirms the field belongs to the
 * authenticated farmer, then delegates aggregation to dashboardService.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const fieldService = require('../services/fieldService');
const dashboardService = require('../services/dashboardService');

/**
 * Load a field and assert the authenticated farmer owns it.
 * @returns {Promise<Field>} the owned field (throws 404 otherwise).
 */
const getOwnedFieldOrFail = async (farmerId, fieldId) => {
  const field = await fieldService.getFieldById(farmerId, fieldId);
  if (!field) {
    throw ApiError.notFound('Field not found.');
  }
  return field;
};

/**
 * @route   GET /api/farmer/dashboard/:fieldId
 * @desc    Aggregated dashboard for a field: current score/week, previous
 *          analyses, totals, avg/high/low scores, and latest weather.
 * @access  Private (farmer)
 */
const getDashboard = asyncHandler(async (req, res) => {
  const field = await getOwnedFieldOrFail(req.farmer._id, req.params.fieldId);
  const dashboard = await dashboardService.getDashboard(field, req.farmer._id);
  return sendResponse(res, 200, 'Dashboard fetched successfully.', dashboard);
});

/**
 * @route   GET /api/farmer/history/:fieldId
 * @desc    All weekly analyses for a field as [{ week, annScore }], sorted by week.
 * @access  Private (farmer)
 */
const getHistory = asyncHandler(async (req, res) => {
  const field = await getOwnedFieldOrFail(req.farmer._id, req.params.fieldId);
  const history = await dashboardService.getHistory(field, req.farmer._id);
  return sendResponse(res, 200, 'History fetched successfully.', history);
});

/**
 * @route   GET /api/farmer/graph/:fieldId
 * @desc    AnnScore timeline for charts: per-week score with week-over-week
 *          difference & percentage change, plus average and growth trend.
 * @access  Private (farmer)
 */
const getGraph = asyncHandler(async (req, res) => {
  const field = await getOwnedFieldOrFail(req.farmer._id, req.params.fieldId);
  const graph = await dashboardService.getGraph(field, req.farmer._id);
  return sendResponse(res, 200, 'Graph data fetched successfully.', graph);
});

module.exports = { getDashboard, getHistory, getGraph };
