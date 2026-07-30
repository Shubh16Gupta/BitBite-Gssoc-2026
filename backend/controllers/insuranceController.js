/**
 * Insurance controllers.
 *
 * Farmer side  (behind verifyFarmer):  quote, apply, list own applications.
 * Insurer side (behind verifyInsurer): review queue, approve/reject, criteria,
 *                                      summary, and crop reports for approved farmers.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const insuranceService = require('../services/insuranceService');

// ---------- Farmer ----------

/**
 * @route   GET /api/farmer/insurance/quote/:cycleId
 * @desc    Preview cover + premium for one of the farmer's crop cycles.
 */
const getQuote = asyncHandler(async (req, res) => {
  const quote = await insuranceService.getQuote(req.farmer._id, req.params.cycleId);
  return sendResponse(res, 200, 'Quote generated.', quote);
});

/**
 * @route   POST /api/farmer/insurance/apply
 * @desc    Apply for crop insurance on a cycle.
 */
const apply = asyncHandler(async (req, res) => {
  const application = await insuranceService.apply(req.farmer._id, req.body.cycleId);
  return sendResponse(res, 201, 'Insurance application submitted.', { application });
});

/**
 * @route   GET /api/farmer/insurance/applications
 */
const listMyApplications = asyncHandler(async (req, res) => {
  const applications = await insuranceService.listForFarmer(req.farmer._id);
  return sendResponse(res, 200, 'Applications fetched.', {
    count: applications.length,
    applications,
  });
});

// ---------- Insurer ----------

/**
 * @route   GET /api/insurer/applications?status=pending|approved|rejected
 */
const listApplications = asyncHandler(async (req, res) => {
  const applications = await insuranceService.listForInsurer(req.insurer._id, {
    status: req.query.status,
  });
  return sendResponse(res, 200, 'Applications fetched.', {
    count: applications.length,
    applications,
  });
});

/**
 * @route   PATCH /api/insurer/applications/:id/approve
 */
const approve = asyncHandler(async (req, res) => {
  const application = await insuranceService.decide(
    req.insurer._id,
    req.params.id,
    'approved',
    req.body?.note
  );
  return sendResponse(res, 200, 'Application approved. Policy issued.', { application });
});

/**
 * @route   PATCH /api/insurer/applications/:id/reject
 */
const reject = asyncHandler(async (req, res) => {
  const application = await insuranceService.decide(
    req.insurer._id,
    req.params.id,
    'rejected',
    req.body?.note
  );
  return sendResponse(res, 200, 'Application rejected.', { application });
});

/**
 * @route   GET /api/insurer/dashboard
 */
const getDashboard = asyncHandler(async (req, res) => {
  const summary = await insuranceService.getSummary(req.insurer._id);
  return sendResponse(res, 200, 'Dashboard fetched.', {
    ...summary,
    minAnnScore: req.insurer.minAnnScore,
  });
});

/**
 * @route   PUT /api/insurer/criteria
 */
const setCriteria = asyncHandler(async (req, res) => {
  const insurer = await insuranceService.setCriteria(req.insurer._id, req.body.minAnnScore);
  return sendResponse(res, 200, 'Underwriting threshold updated.', {
    minAnnScore: insurer.minAnnScore,
  });
});

/**
 * @route   GET /api/insurer/farmers/:farmerId/report
 * @desc    Crop-analysis report — allowed only for farmers this insurer approved.
 */
const getFarmerReport = asyncHandler(async (req, res) => {
  const report = await insuranceService.getFarmerReport(req.insurer._id, req.params.farmerId);
  return sendResponse(res, 200, 'Farmer report fetched.', report);
});

module.exports = {
  getQuote,
  apply,
  listMyApplications,
  listApplications,
  approve,
  reject,
  getDashboard,
  setCriteria,
  getFarmerReport,
};
