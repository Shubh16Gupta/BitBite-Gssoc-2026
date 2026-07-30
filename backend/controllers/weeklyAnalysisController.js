/**
 * Weekly Crop Analysis controller.
 *
 * Runs behind `verifyFarmer`, so `req.farmer` is guaranteed. The controller
 * validates ownership of the target field and the uploaded image count, then
 * delegates the upload/weather/AI/persist pipeline to weeklyAnalysisService.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const fieldService = require('../services/fieldService');
const weeklyAnalysisService = require('../services/weeklyAnalysisService');

const MIN_IMAGES = 3;
const MAX_IMAGES = 5;

/**
 * @route   POST /api/farmer/weekly-analysis
 * @desc    Upload a week's crop images for a field, enrich with weather + AI
 *          score, and store the analysis. One upload per field per week.
 * @access  Private (farmer)
 */
const createWeeklyAnalysis = asyncHandler(async (req, res) => {
  const { fieldId, weekNumber } = req.body;
  const files = req.files || [];

  // Validate image count (Multer handles per-file type/size).
  if (files.length < MIN_IMAGES || files.length > MAX_IMAGES) {
    throw ApiError.badRequest(
      `Please upload between ${MIN_IMAGES} and ${MAX_IMAGES} crop images.`
    );
  }

  // Ownership: the field must exist and belong to the authenticated farmer.
  const field = await fieldService.getFieldById(req.farmer._id, fieldId);
  if (!field) {
    throw ApiError.notFound('Field not found.');
  }

  const analysis = await weeklyAnalysisService.createWeeklyAnalysis({
    field,
    farmerId: req.farmer._id,
    weekNumber,
    files,
  });

  return sendResponse(res, 201, 'Weekly analysis created successfully.', { analysis });
});

/**
 * @route   GET /api/farmer/weekly-analysis
 * @desc    List the farmer's analyses, optionally filtered by ?fieldId / ?weekNumber.
 * @access  Private (farmer)
 */
const getWeeklyAnalyses = asyncHandler(async (req, res) => {
  const analyses = await weeklyAnalysisService.listAnalyses(req.farmer._id, {
    fieldId: req.query.fieldId,
    weekNumber: req.query.weekNumber,
  });

  return sendResponse(res, 200, 'Weekly analyses fetched successfully.', {
    count: analyses.length,
    analyses,
  });
});

/**
 * @route   GET /api/farmer/weekly-analysis/:id
 * @desc    Fetch a single analysis owned by the farmer.
 * @access  Private (farmer)
 */
const getWeeklyAnalysis = asyncHandler(async (req, res) => {
  const analysis = await weeklyAnalysisService.getAnalysisById(req.farmer._id, req.params.id);
  if (!analysis) {
    throw ApiError.notFound('Analysis not found.');
  }
  return sendResponse(res, 200, 'Weekly analysis fetched successfully.', { analysis });
});

module.exports = { createWeeklyAnalysis, getWeeklyAnalyses, getWeeklyAnalysis };
