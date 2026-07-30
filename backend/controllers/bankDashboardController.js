/**
 * Bank dashboard controller.
 *
 * Runs behind `verifyBank` (approved banks only). Lets a bank set its lending
 * threshold (minimum AnnScore) and view farmers who meet it.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const bankService = require('../services/bankService');

/**
 * Resolve the threshold to use: an explicit ?minAnnScore query wins, otherwise
 * the bank's saved threshold. Throws if neither is set.
 */
const resolveThreshold = (req) => {
  const fromQuery = req.query.minAnnScore;
  const threshold = fromQuery !== undefined ? Number(fromQuery) : req.bank.minAnnScore;
  if (threshold === null || threshold === undefined || Number.isNaN(threshold)) {
    throw ApiError.badRequest('Set a threshold AnnScore first (PUT /api/bank/criteria).');
  }
  return threshold;
};

/**
 * @route   GET /api/bank/criteria
 * @desc    Get this bank's saved threshold AnnScore.
 * @access  Private (bank)
 */
const getCriteria = asyncHandler(async (req, res) =>
  sendResponse(res, 200, 'Criteria fetched.', { minAnnScore: req.bank.minAnnScore })
);

/**
 * @route   PUT /api/bank/criteria
 * @desc    Set/post this bank's threshold AnnScore.
 * @access  Private (bank)
 */
const setCriteria = asyncHandler(async (req, res) => {
  const bank = await bankService.setCriteria(req.bank._id, req.body.minAnnScore);
  return sendResponse(res, 200, 'Threshold updated.', { minAnnScore: bank.minAnnScore });
});

/**
 * @route   GET /api/bank/eligible-farmers
 * @desc    List farmers whose AnnScore meets the threshold (query overrides saved).
 * @access  Private (bank)
 */
const getEligibleFarmers = asyncHandler(async (req, res) => {
  const threshold = resolveThreshold(req);
  const farmers = await bankService.getEligibleFarmers(threshold);
  return sendResponse(res, 200, 'Eligible farmers fetched.', {
    threshold,
    count: farmers.length,
    farmers,
  });
});

/**
 * @route   GET /api/bank/dashboard
 * @desc    Summary numbers at the current threshold.
 * @access  Private (bank)
 */
const getDashboard = asyncHandler(async (req, res) => {
  const threshold = resolveThreshold(req);
  const summary = await bankService.getSummary(threshold);
  return sendResponse(res, 200, 'Dashboard fetched.', summary);
});

/**
 * @route   GET /api/bank/farmers/:farmerId/report
 * @desc    Full AnnScore report for a farmer (per-cycle/per-phase breakdown +
 *          an explanation of why the score was awarded).
 * @access  Private (bank)
 */
const getFarmerReport = asyncHandler(async (req, res) => {
  const report = await bankService.getFarmerReport(req.params.farmerId);
  if (!report) throw ApiError.notFound('Farmer not found.');
  return sendResponse(res, 200, 'Farmer report fetched.', report);
});

module.exports = { getCriteria, setCriteria, getEligibleFarmers, getDashboard, getFarmerReport };
