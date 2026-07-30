/**
 * Bank routes: /api/bank/*
 */
const express = require('express');

const router = express.Router();

const upload = require('../middleware/upload');
const validate = require('../middleware/validate');
const { verifyBank } = require('../middleware/authMiddleware');
const {
  signupValidator,
  loginValidator,
  setCriteriaValidator,
  thresholdQueryValidator,
  farmerIdParamValidator,
} = require('../validators/bankValidator');
const { signup, login } = require('../controllers/bankAuthController');
const {
  getCriteria,
  setCriteria,
  getEligibleFarmers,
  getDashboard,
  getFarmerReport,
} = require('../controllers/bankDashboardController');
const { statusQueryValidator, loanIdValidator } = require('../validators/loanValidator');
const {
  listBankLoans,
  approveLoan,
  rejectLoan,
  getBankLoanSummary,
} = require('../controllers/loanController');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');

// --- Signup (with employee ID card upload) ---
router.post(
  '/signup',
  upload.single('employeeIdCard'),
  signupValidator,
  validate,
  signup
);

// --- Login ---
router.post('/login', loginValidator, validate, login);

// --- Example protected route (approved banks only) ---
router.get(
  '/me',
  verifyBank,
  asyncHandler(async (req, res) => {
    return sendResponse(res, 200, 'Bank profile fetched.', { bank: req.bank });
  })
);

// --- Dashboard: lending threshold + eligible farmers (approved banks only) ---
router
  .route('/criteria')
  .get(verifyBank, getCriteria)
  .put(verifyBank, setCriteriaValidator, validate, setCriteria);

router.get('/eligible-farmers', verifyBank, thresholdQueryValidator, validate, getEligibleFarmers);
router.get('/dashboard', verifyBank, thresholdQueryValidator, validate, getDashboard);

// Drill-down: a farmer's full AnnScore report (why they got the score).
router.get('/farmers/:farmerId/report', verifyBank, farmerIdParamValidator, validate, getFarmerReport);

// --- Loan applications addressed to this bank ---
router.get('/loans/summary', verifyBank, getBankLoanSummary);
router.get('/loans', verifyBank, statusQueryValidator, validate, listBankLoans);
router.patch('/loans/:id/approve', verifyBank, loanIdValidator, validate, approveLoan);
router.patch('/loans/:id/reject', verifyBank, loanIdValidator, validate, rejectLoan);

module.exports = router;
