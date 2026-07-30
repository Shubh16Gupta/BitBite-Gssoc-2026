/**
 * Crop cycle service — orchestrates the full weekly/phase pipeline.
 *
 * startCycle:  resolve crop from the catalog, compute the 4-phase schedule, and
 *              create an active cycle for a field the farmer owns.
 *
 * submitPhase: run the pipeline for one phase —
 *   1. Upload photos to Cloudinary.
 *   2. Crop-health AI (10 random patches/image -> cropHealthScore).
 *   3. Use the field's stored GPS location.
 *   4. Fetch current weather.
 *   5. Fetch recent rainfall history.
 *   6. Resolve the growth stage for the phase.
 *   7. Update the health trend vs. previous phases.
 *   8. Predict yield (rule-based engine).
 *   9. Generate the phase farm report.
 *   After the final phase, store the final yield and complete the cycle.
 */
const CropCycle = require('../models/CropCycle');
const ApiError = require('../utils/ApiError');
const cropCatalog = require('../config/cropCatalog');
const cloudinaryService = require('./cloudinaryService');
const aiService = require('./aiService');
const weatherService = require('./weatherService');
const rainfallService = require('./rainfallService');
const growthStageService = require('./growthStageService');
const yieldService = require('./yieldPredictionService');
const scoreService = require('./scoreService');
const reportService = require('./reportService');
const marketService = require('./marketPriceService');
const forensicsService = require('./imageForensicsService');

/**
 * Create a new crop cycle for a field.
 * @param {object} args - { field, farmerId, cropType, sowingDate, farmSizeOverride? }
 */
const startCycle = async ({ field, farmerId, cropType, sowingDate, farmSizeOverride }) => {
  const crop = cropCatalog.getCrop(cropType);
  if (!crop) {
    throw ApiError.badRequest(
      `Unknown crop "${cropType}". Use GET /crop-cycles/catalog for supported crops.`
    );
  }

  const farmSize = farmSizeOverride != null ? farmSizeOverride : field.area;
  const farmSizeUnit = field.areaUnit || 'acre';

  const phaseSchedule = growthStageService.buildPhaseSchedule(
    sowingDate,
    crop.durationDays,
    crop.stages
  );

  return CropCycle.create({
    field: field._id,
    farmer: farmerId,
    cropType: crop.key,
    cropLabel: crop.label,
    sowingDate,
    durationDays: crop.durationDays,
    totalPhases: growthStageService.TOTAL_PHASES,
    avgYieldPerAcre: crop.avgYieldPerAcre,
    yieldUnit: crop.yieldUnit,
    farmSize,
    farmSizeUnit,
    phaseSchedule,
    phases: [],
    status: 'active',
  });
};

/**
 * Derive a disease/stress severity from the crop-health score.
 *
 * We intentionally do NOT run a separate disease classifier — the vision model
 * produces a single crop-health score, and low health is treated as the
 * stress/disease signal. This is a computed OUTPUT, never a farmer input.
 */
const deriveDiseaseSeverity = (healthScore) => {
  if (typeof healthScore !== 'number') return 'none';
  if (healthScore >= 75) return 'none';
  if (healthScore >= 55) return 'low';
  if (healthScore >= 35) return 'medium';
  return 'high';
};

/**
 * Determine the health trend for the current phase vs. the previous one.
 */
const deriveTrend = (previousPhase, currentScore) => {
  if (!previousPhase || typeof previousPhase.cropHealthScore !== 'number') return 'stable';
  const delta = currentScore - previousPhase.cropHealthScore;
  if (delta > 2) return 'improving';
  if (delta < -2) return 'declining';
  return 'stable';
};

/**
 * Submit one phase of a crop cycle and run the pipeline.
 * @param {object} args - { cycle, field, farmerId, phaseNumber, files, diseaseSeverity }
 * @returns {Promise<{ cycle, phase, report }>}
 */
const submitPhase = async ({ cycle, field, farmerId, phaseNumber, files }) => {
  if (cycle.status === 'completed') {
    throw ApiError.conflict('This crop cycle is already completed.');
  }
  if (cycle.phases.some((p) => p.phaseNumber === phaseNumber)) {
    throw ApiError.conflict(`Phase ${phaseNumber} has already been submitted for this cycle.`);
  }

  const stageInfo = growthStageService.getPhaseInfo(cycle.phaseSchedule, phaseNumber);
  if (!stageInfo) {
    throw ApiError.badRequest(`Invalid phase ${phaseNumber} for this cycle.`);
  }

  // 0. Anti-fraud pre-checks on the raw photos (EXIF GPS/time + exact reuse).
  //    Throws on hard fails (location mismatch, invalid time, duplicate images).
  const forensics = await forensicsService.prescreen({ files, field, cycle, farmerId });

  // 1. Upload photos.
  const imageUrls = await cloudinaryService.uploadImages(files);

  // 2. Crop-health AI.
  const cropResult = await aiService.analyzeCropHealth({ imageUrls });
  const cropHealthScore = cropResult.cropHealthScore;

  // 2b. Near-duplicate check against other farmers' photos (perceptual hash).
  await forensicsService.checkNearDuplicates({ farmerId, images: cropResult.images });

  // 2c. Data-confidence summary (unverified location/time or mock model lower it).
  const verification = forensicsService.buildVerification({
    withGps: forensics.withGps,
    withTime: forensics.withTime,
    imageCount: files.length,
    mocked: cropResult.model === 'mock' || cropResult.mocked === true,
  });

  // Disease/stress severity is DERIVED from crop health (a computed output).
  const diseaseSeverity = deriveDiseaseSeverity(cropHealthScore);

  // 3–5. Location (stored GPS) -> weather + rainfall.
  const { latitude, longitude } = field.location;
  const [weather, rainfall] = await Promise.all([
    weatherService.getCurrentWeather(latitude, longitude),
    rainfallService.getRainfallHistory(latitude, longitude),
  ]);

  // 6. Growth stage (from the phase schedule).
  const progressPct = growthStageService.progressPercent(cycle.sowingDate, cycle.durationDays);

  // 7. Health trend vs. the most recent prior phase.
  const previousPhase = cycle.phases
    .slice()
    .sort((a, b) => b.phaseNumber - a.phaseNumber)[0];
  const healthTrend = deriveTrend(previousPhase, cropHealthScore);

  // Blend health with weather (kept for continuity with the weekly module).
  const blend = scoreService.composeAnnScore(cropHealthScore, weather);

  // 8. Yield prediction (rule-based).
  const weatherCategory = yieldService.classifyWeather(weather, rainfall);
  const yieldPrediction = yieldService.predict({
    cropType: cycle.cropLabel,
    avgYieldPerAcre: cycle.avgYieldPerAcre,
    farmSize: cycle.farmSize,
    farmSizeUnit: cycle.farmSizeUnit,
    healthScore: cropHealthScore,
    growthStage: stageInfo.stageName,
    confidence: stageInfo.confidence,
    weather,
    rainfall,
    diseaseSeverity,
    healthTrend,
    unit: cycle.yieldUnit,
  });

  const isFinalPhase = phaseNumber === cycle.totalPhases;

  // 8b. Market price (mandi) + estimated revenue = yield × modal price (non-fatal).
  const marketPrice = await marketService.getPrice(cycle.cropType);
  const revenue = marketService.estimateRevenue(yieldPrediction.estimatedYield, marketPrice);
  const estimatedRevenue = revenue ? revenue.estimatedRevenue : null;

  // 9. Phase report.
  const report = reportService.generatePhaseReport({
    cropLabel: cycle.cropLabel,
    phaseNumber,
    totalPhases: cycle.totalPhases,
    stageName: stageInfo.stageName,
    confidence: stageInfo.confidence,
    progressPct,
    healthScore: cropHealthScore,
    annScore: blend.annScore,
    healthTrend,
    weather,
    rainfall,
    weatherCategory,
    yieldPrediction,
    marketPrice,
    estimatedRevenue,
    isFinalPhase,
  });
  report.verification = verification;

  // Append the phase and persist.
  cycle.phases.push({
    phaseNumber,
    stageName: stageInfo.stageName,
    imageUrls,
    cropHealthScore,
    annScore: blend.annScore,
    healthTrend,
    diseaseSeverity,
    weather,
    rainfall,
    yield: yieldPrediction,
    report,
    analysisMeta: {
      model: cropResult.model,
      sampleCount: cropResult.sampleCount,
      images: cropResult.images,
      weatherWeight: blend.weatherWeight,
    },
  });

  if (isFinalPhase) {
    cycle.finalYield = yieldPrediction;
    cycle.status = 'completed';
  }

  await cycle.save();

  // Record image fingerprints so these exact/near-duplicate photos can't be reused.
  await forensicsService.saveFingerprints({
    shas: forensics.shas,
    images: cropResult.images,
    farmerId,
    fieldId: field._id,
    cycleId: cycle._id,
    phaseNumber,
  });

  const savedPhase = cycle.phases.find((p) => p.phaseNumber === phaseNumber);
  return { cycle, phase: savedPhase, report };
};

// --- Reads (scoped to the owning farmer) ---

const listCycles = (farmerId, filter = {}) => {
  const query = { farmer: farmerId };
  if (filter.fieldId) query.field = filter.fieldId;
  if (filter.status) query.status = filter.status;
  return CropCycle.find(query).sort({ createdAt: -1 });
};

const getCycleById = (farmerId, cycleId) =>
  CropCycle.findOne({ _id: cycleId, farmer: farmerId });

module.exports = { startCycle, submitPhase, listCycles, getCycleById };
