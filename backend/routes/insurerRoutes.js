/**
 * Insurer routes: /api/insurer/*
 * Auth is public; everything else requires an APPROVED insurer.
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const { verifyInsurer } = require('../middleware/authMiddleware');
const {
  signupValidator,
  loginValidator,
  setCriteriaValidator,
  statusQueryValidator,
  applicationIdValidator,
  farmerIdParamValidator,
} = require('../validators/insuranceValidator');
const { signup, login } = require('../controllers/insurerAuthController');
const {
  listApplications,
  approve,
  reject,
  getDashboard,
  setCriteria,
  getFarmerReport,
} = require('../controllers/insuranceController');

// --- Auth ---
router.post('/signup', signupValidator, validate, signup);
router.post('/login', loginValidator, validate, login);

// --- Dashboard (approved insurers only) ---
router.get('/dashboard', verifyInsurer, getDashboard);
router.put('/criteria', verifyInsurer, setCriteriaValidator, validate, setCriteria);

// --- Application review queue ---
router.get('/applications', verifyInsurer, statusQueryValidator, validate, listApplications);
router.patch('/applications/:id/approve', verifyInsurer, applicationIdValidator, validate, approve);
router.patch('/applications/:id/reject', verifyInsurer, applicationIdValidator, validate, reject);

// --- Crop reports (only for farmers this insurer approved) ---
router.get(
  '/farmers/:farmerId/report',
  verifyInsurer,
  farmerIdParamValidator,
  validate,
  getFarmerReport
);

module.exports = router;
