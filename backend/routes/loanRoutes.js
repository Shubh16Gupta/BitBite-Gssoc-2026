/**
 * Farmer loan + activity routes: /api/farmer/loans/*, /api/farmer/activity
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const { verifyFarmer } = require('../middleware/authMiddleware');
const { applyValidator } = require('../validators/loanValidator');
const { listBanks, apply, listMyLoans } = require('../controllers/loanController');

router.use(verifyFarmer);

// Static path before any dynamic ones.
router.get('/banks', listBanks);

router.route('/').get(listMyLoans).post(applyValidator, validate, apply);

module.exports = router;
