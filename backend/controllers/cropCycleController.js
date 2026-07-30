/**
 * Crop cycle controller.
 *
 * Runs behind `verifyFarmer`. Confirms field/cycle ownership, then delegates the
 * pipeline to cropCycleService. Handles the crop catalog lookup endpoint too.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const cropCatalog = require('../config/cropCatalog');
const fieldService = require('../services/fieldService');
const cropCycleService = require('../services/cropCycleService');

const MIN_IMAGES = 3;
const MAX_IMAGES = 5;

/**
 * @route   GET /api/farmer/crop-cycles/catalog
 * @desc    List supported crops (durations + baseline yields).
 * @access  Private (farmer)
 */
const getCatalog = asyncHandler(async (_req, res) =>
  sendResponse(res, 200, 'Crop catalog fetched successfully.', { crops: cropCatalog.listCrops() })
);

/**
 * @route   POST /api/farmer/crop-cycles
 * @desc    Start a crop cycle for a field (crop type + sowing date).
 * @access  Private (farmer)
 */
const startCycle = asyncHandler(async (req, res) => {
  const { fieldId, cropType, sowingDate, farmSize } = req.body;

  const field = await fieldService.getFieldById(req.farmer._id, fieldId);
  if (!field) throw ApiError.notFound('Field not found.');

  const cycle = await cropCycleService.startCycle({
    field,
    farmerId: req.farmer._id,
    cropType,
    sowingDate,
    farmSizeOverride: farmSize,
  });

  return sendResponse(res, 201, 'Crop cycle started successfully.', { cycle });
});

/**
 * @route   POST /api/farmer/crop-cycles/:cycleId/phases
 * @desc    Submit a phase upload and run the full analysis pipeline.
 * @access  Private (farmer)
 */
const submitPhase = asyncHandler(async (req, res) => {
  const { phaseNumber } = req.body;
  const files = req.files || [];

  if (files.length < MIN_IMAGES || files.length > MAX_IMAGES) {
    throw ApiError.badRequest(`Please upload between ${MIN_IMAGES} and ${MAX_IMAGES} crop images.`);
  }

  const cycle = await cropCycleService.getCycleById(req.farmer._id, req.params.cycleId);
  if (!cycle) throw ApiError.notFound('Crop cycle not found.');

  // Load the field for its stored GPS location (also re-confirms ownership).
  const field = await fieldService.getFieldById(req.farmer._id, cycle.field);
  if (!field) throw ApiError.notFound('Field for this crop cycle not found.');

  const result = await cropCycleService.submitPhase({
    cycle,
    field,
    farmerId: req.farmer._id,
    phaseNumber,
    files,
  });

  const message = result.report.isFinalPhase
    ? 'Final phase analyzed. Crop cycle completed with a final yield prediction.'
    : `Phase ${phaseNumber} analyzed successfully.`;

  return sendResponse(res, 201, message, {
    phase: result.phase,
    report: result.report,
    status: result.cycle.status,
    finalYield: result.cycle.finalYield,
  });
});

/**
 * @route   GET /api/farmer/crop-cycles
 * @desc    List the farmer's crop cycles (optional ?fieldId / ?status).
 * @access  Private (farmer)
 */
const getCycles = asyncHandler(async (req, res) => {
  const cycles = await cropCycleService.listCycles(req.farmer._id, {
    fieldId: req.query.fieldId,
    status: req.query.status,
  });
  return sendResponse(res, 200, 'Crop cycles fetched successfully.', {
    count: cycles.length,
    cycles,
  });
});

/**
 * @route   GET /api/farmer/crop-cycles/:cycleId
 * @desc    Fetch a single crop cycle with all phases + reports.
 * @access  Private (farmer)
 */
const getCycle = asyncHandler(async (req, res) => {
  const cycle = await cropCycleService.getCycleById(req.farmer._id, req.params.cycleId);
  if (!cycle) throw ApiError.notFound('Crop cycle not found.');
  return sendResponse(res, 200, 'Crop cycle fetched successfully.', { cycle });
});

module.exports = { getCatalog, startCycle, submitPhase, getCycles, getCycle };
