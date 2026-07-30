/**
 * Weekly analysis service.
 *
 * Orchestrates the weekly-upload pipeline and owns all data access for
 * WeeklyAnalysis documents. Ownership is enforced by always scoping queries to
 * the authenticated farmer's id.
 *
 * Pipeline (createWeeklyAnalysis):
 *   1. Reject duplicates for the same field + week (before any upload work).
 *   2. Upload images to Cloudinary -> secure URLs.
 *   3. Fetch current weather for the field's location.
 *   4. Run crop-health inference (ML service) -> cropHealthScore + detail.
 *   5. Blend crop-health with weather -> final annScore.
 *   6. Persist everything in MongoDB.
 */
const WeeklyAnalysis = require('../models/WeeklyAnalysis');
const ApiError = require('../utils/ApiError');
const cloudinaryService = require('./cloudinaryService');
const weatherService = require('./weatherService');
const aiService = require('./aiService');
const scoreService = require('./scoreService');

/**
 * Create a weekly analysis for a field the caller owns.
 * @param {object} args
 * @param {object} args.field - the owned Field document (has _id, location, farmer).
 * @param {string} args.farmerId
 * @param {number} args.weekNumber
 * @param {Array<{ buffer: Buffer }>} args.files - Multer memory files (3–5 images).
 * @returns {Promise<WeeklyAnalysis>}
 */
const createWeeklyAnalysis = async ({ field, farmerId, weekNumber, files }) => {
  // 1. Guard against a duplicate upload for this field + week.
  const existing = await WeeklyAnalysis.findOne({ field: field._id, weekNumber });
  if (existing) {
    throw ApiError.conflict(
      `An analysis for week ${weekNumber} already exists for this field.`
    );
  }

  // 2. Upload images to Cloudinary.
  const imageUrls = await cloudinaryService.uploadImages(files);

  // 3. Fetch current weather (non-fatal — returns { available: false } on error).
  const weather = await weatherService.getCurrentWeather(
    field.location.latitude,
    field.location.longitude
  );

  // 4. Run crop-health inference over the uploaded images (10 random patches
  //    per image, scored and averaged into a field crop-health score).
  const cropResult = await aiService.analyzeCropHealth({ imageUrls });

  // 5. Blend the crop-health score with weather favorability -> final annScore.
  const score = scoreService.composeAnnScore(cropResult.cropHealthScore, weather);

  // 6. Persist. The unique index is a backstop against a race on step 1.
  try {
    return await WeeklyAnalysis.create({
      field: field._id,
      farmer: farmerId,
      weekNumber,
      imageUrls,
      weather,
      annScore: score.annScore,
      cropHealthScore: score.cropHealthScore,
      weatherScore: score.weatherScore,
      analysisMeta: {
        model: cropResult.model,
        sampleCount: cropResult.sampleCount,
        weatherWeight: score.weatherWeight,
        images: cropResult.images,
      },
    });
  } catch (err) {
    if (err && err.code === 11000) {
      throw ApiError.conflict(
        `An analysis for week ${weekNumber} already exists for this field.`
      );
    }
    throw err;
  }
};

/**
 * List analyses for a farmer, optionally filtered by field, newest week first.
 * @param {string} farmerId
 * @param {object} [filter] - { fieldId?, weekNumber? }
 * @returns {Promise<WeeklyAnalysis[]>}
 */
const listAnalyses = (farmerId, filter = {}) => {
  const query = { farmer: farmerId };
  if (filter.fieldId) query.field = filter.fieldId;
  if (filter.weekNumber !== undefined) query.weekNumber = filter.weekNumber;
  return WeeklyAnalysis.find(query).sort({ weekNumber: -1, createdAt: -1 });
};

/**
 * Fetch a single analysis owned by the farmer.
 * @returns {Promise<WeeklyAnalysis|null>}
 */
const getAnalysisById = (farmerId, analysisId) =>
  WeeklyAnalysis.findOne({ _id: analysisId, farmer: farmerId });

module.exports = { createWeeklyAnalysis, listAnalyses, getAnalysisById };
