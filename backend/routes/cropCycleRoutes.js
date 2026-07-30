/**
 * Crop cycle routes: /api/farmer/crop-cycles/*
 *
 * Every route is guarded by `verifyFarmer` and scoped to the farmer's own data.
 * Phase submission parses images in memory (streamed to Cloudinary) before
 * validation + the controller.
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const uploadMemory = require('../middleware/uploadMemory');
const { verifyFarmer } = require('../middleware/authMiddleware');
const {
  startCycleValidator,
  submitPhaseValidator,
  cycleIdValidator,
} = require('../validators/cropCycleValidator');
const {
  getCatalog,
  startCycle,
  submitPhase,
  getCycles,
  getCycle,
} = require('../controllers/cropCycleController');

router.use(verifyFarmer);

// Static path first so it isn't captured by /:cycleId.
router.get('/catalog', getCatalog);

router
  .route('/')
  .get(getCycles)
  .post(startCycleValidator, validate, startCycle);

router.get('/:cycleId', cycleIdValidator, validate, getCycle);

router.post(
  '/:cycleId/phases',
  uploadMemory.array('images', 5),
  submitPhaseValidator,
  validate,
  submitPhase
);

module.exports = router;
