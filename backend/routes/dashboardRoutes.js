/**
 * Farmer dashboard routes:
 *   GET /api/farmer/dashboard/:fieldId
 *   GET /api/farmer/history/:fieldId
 *   GET /api/farmer/graph/:fieldId
 *
 * Every route is guarded by `verifyFarmer` and scoped to the farmer's own field.
 * Flow: auth -> validation chain -> validate -> controller.
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const { verifyFarmer } = require('../middleware/authMiddleware');
const { fieldIdParamValidator } = require('../validators/dashboardValidator');
const { getDashboard, getHistory, getGraph } = require('../controllers/dashboardController');
const { getActivity, getScore } = require('../controllers/loanController');

// All dashboard routes require an authenticated farmer.
router.use(verifyFarmer);

router.get('/dashboard/:fieldId', fieldIdParamValidator, validate, getDashboard);
router.get('/history/:fieldId', fieldIdParamValidator, validate, getHistory);
router.get('/graph/:fieldId', fieldIdParamValidator, validate, getGraph);

// Recent activity feed (derived from the farmer's own records).
router.get('/activity', getActivity);

// The farmer's own AnnScore.
router.get('/score', getScore);

module.exports = router;
