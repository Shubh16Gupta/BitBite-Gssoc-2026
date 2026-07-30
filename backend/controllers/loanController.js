/**
 * Loan controllers.
 * Farmer side (verifyFarmer): list banks, apply, list own applications, activity.
 * Bank side  (verifyBank)  : review queue for this bank, approve/reject, summary.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const loanService = require('../services/loanService');
const activityService = require('../services/activityService');

// ---------- Farmer ----------

/**
 * @route GET /api/farmer/loans/banks
 * @desc  Approved banks the farmer can apply to.
 */
const listBanks = asyncHandler(async (_req, res) => {
  const banks = await loanService.listApprovedBanks();
  return sendResponse(res, 200, 'Banks fetched.', { count: banks.length, banks });
});

/**
 * @route POST /api/farmer/loans
 */
const apply = asyncHandler(async (req, res) => {
  const loan = await loanService.apply(req.farmer._id, {
    bankId: req.body.bankId,
    amount: req.body.amount,
    cropType: req.body.cropType,
    landArea: req.body.landArea,
    purpose: req.body.purpose,
    existingLoans: req.body.existingLoans,
  });
  return sendResponse(res, 201, 'Loan application submitted.', { loan });
});

/**
 * @route GET /api/farmer/loans
 */
const listMyLoans = asyncHandler(async (req, res) => {
  const loans = await loanService.listForFarmer(req.farmer._id);
  return sendResponse(res, 200, 'Loans fetched.', { count: loans.length, loans });
});

/**
 * @route GET /api/farmer/activity
 */
const getActivity = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const activity = await activityService.getFarmerActivity(req.farmer._id, limit);
  return sendResponse(res, 200, 'Activity fetched.', { count: activity.length, activity });
});

// ---------- Bank ----------

/**
 * @route GET /api/bank/loans?status=pending
 */
const listBankLoans = asyncHandler(async (req, res) => {
  const loans = await loanService.listForBank(req.bank._id, { status: req.query.status });
  return sendResponse(res, 200, 'Loan applications fetched.', { count: loans.length, loans });
});

/**
 * @route PATCH /api/bank/loans/:id/approve
 */
const approveLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.decide(req.bank._id, req.params.id, 'approved', req.body?.note);
  return sendResponse(res, 200, 'Loan approved.', { loan });
});

/**
 * @route PATCH /api/bank/loans/:id/reject
 */
const rejectLoan = asyncHandler(async (req, res) => {
  const loan = await loanService.decide(req.bank._id, req.params.id, 'rejected', req.body?.note);
  return sendResponse(res, 200, 'Loan rejected.', { loan });
});

/**
 * @route GET /api/bank/loans/summary
 */
const getBankLoanSummary = asyncHandler(async (req, res) => {
  const summary = await loanService.getBankSummary(req.bank._id);
  return sendResponse(res, 200, 'Loan summary fetched.', summary);
});

module.exports = {
  listBanks,
  apply,
  listMyLoans,
  getActivity,
  listBankLoans,
  approveLoan,
  rejectLoan,
  getBankLoanSummary,
};
