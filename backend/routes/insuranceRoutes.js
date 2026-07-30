/**
 * Farmer-facing insurance routes: /api/farmer/insurance/*
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const { verifyFarmer } = require('../middleware/authMiddleware');
const { applyValidator, cycleIdParamValidator } = require('../validators/insuranceValidator');
const { getQuote, apply, listMyApplications } = require('../controllers/insuranceController');

router.use(verifyFarmer);

router.get('/quote/:cycleId', cycleIdParamValidator, validate, getQuote);
router.post('/apply', applyValidator, validate, apply);
router.get('/applications', listMyApplications);

module.exports = router;
