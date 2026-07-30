/**
 * Weekly Crop Analysis routes: /api/farmer/weekly-analysis/*
 *
 * Every route is guarded by `verifyFarmer` and scoped to the farmer's own data.
 * Create flow: auth -> parse images (memory) -> validation chains -> validate
 * -> controller.
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const uploadMemory = require('../middleware/uploadMemory');
const { verifyFarmer } = require('../middleware/authMiddleware');
const {
  createWeeklyAnalysisValidator,
  listWeeklyAnalysisValidator,
  analysisIdValidator,
} = require('../validators/weeklyAnalysisValidator');
const {
  createWeeklyAnalysis,
  getWeeklyAnalyses,
  getWeeklyAnalysis,
} = require('../controllers/weeklyAnalysisController');

// All weekly-analysis routes require an authenticated farmer.
router.use(verifyFarmer);

router
  .route('/')
  .get(listWeeklyAnalysisValidator, validate, getWeeklyAnalyses)
  .post(
    uploadMemory.array('images', 5), // accept up to 5; min enforced in controller
    createWeeklyAnalysisValidator,
    validate,
    createWeeklyAnalysis
  );

router.get('/:id', analysisIdValidator, validate, getWeeklyAnalysis);

module.exports = router;
