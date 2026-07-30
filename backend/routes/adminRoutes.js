/**
 * Admin routes: /api/admin/*
 * Bank-approval endpoints are guarded by verifyAdmin.
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const { verifyAdmin } = require('../middleware/authMiddleware');
const { loginValidator, bankIdValidator } = require('../validators/adminValidator');
const {
  login,
  listBanks,
  approveBank,
  rejectBank,
  listInsurers,
  approveInsurer,
  rejectInsurer,
} = require('../controllers/adminController');

// --- Auth ---
router.post('/login', loginValidator, validate, login);

// --- Bank review (admin only) ---
router.get('/banks', verifyAdmin, listBanks);
router.patch('/banks/:id/approve', verifyAdmin, bankIdValidator, validate, approveBank);
router.patch('/banks/:id/reject', verifyAdmin, bankIdValidator, validate, rejectBank);

// --- Insurer review (admin only) ---
router.get('/insurers', verifyAdmin, listInsurers);
router.patch('/insurers/:id/approve', verifyAdmin, bankIdValidator, validate, approveInsurer);
router.patch('/insurers/:id/reject', verifyAdmin, bankIdValidator, validate, rejectInsurer);

module.exports = router;
