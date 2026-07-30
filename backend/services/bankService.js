/**
 * Bank service.
 *
 * Powers the bank dashboard: storing a bank's lending threshold and finding
 * farmers whose AnnScore meets it.
 *
 * A farmer's AnnScore for lending is the average of their crop cycles' scores,
 * where each cycle's score is the average AnnScore across its submitted phases.
 * Only cycles with at least one analyzed phase count. The heavy lifting is done
 * in a single MongoDB aggregation.
 */
const CropCycle = require('../models/CropCycle');
const Bank = require('../models/Bank');
const Farmer = require('../models/Farmer');
const env = require('../config/env');

const round1 = (n) => (typeof n === 'number' ? Math.round(n * 10) / 10 : null);
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const scoreLabel = (s) =>
  s == null ? 'no data' : s >= 85 ? 'excellent' : s >= 70 ? 'healthy' : s >= 50 ? 'needs attention' : 'at risk';

/**
 * Persist a bank's minimum-AnnScore threshold.
 * @returns {Promise<Bank>}
 */
const setCriteria = (bankId, minAnnScore) =>
  Bank.findByIdAndUpdate(bankId, { minAnnScore }, { new: true, runValidators: true });

/**
 * Build the per-farmer scoring pipeline stages (shared by list + summary).
 * Produces one row per farmer that has any analyzed phase, with a rounded
 * `annScore`, average crop health, cycle count, crops, and predicted yield.
 */
const farmerScoreStages = () => [
  // Per-cycle representative scores from its phases.
  {
    $addFields: {
      cycleAnnScore: { $avg: '$phases.annScore' },
      cycleCropHealth: { $avg: '$phases.cropHealthScore' },
      phasesSubmitted: { $size: '$phases' },
    },
  },
  { $match: { phasesSubmitted: { $gt: 0 } } },
  // Aggregate cycles up to the farmer.
  {
    $group: {
      _id: '$farmer',
      annScore: { $avg: '$cycleAnnScore' },
      cropHealth: { $avg: '$cycleCropHealth' },
      bestAnnScore: { $max: '$cycleAnnScore' },
      cyclesCount: { $sum: 1 },
      crops: { $addToSet: '$cropLabel' },
      predictedYield: { $sum: { $ifNull: ['$finalYield.estimatedYield', 0] } },
      lastActivity: { $max: '$updatedAt' },
    },
  },
  {
    $addFields: {
      annScore: { $round: ['$annScore', 1] },
      cropHealth: { $round: ['$cropHealth', 1] },
      bestAnnScore: { $round: ['$bestAnnScore', 1] },
    },
  },
];

/**
 * List farmers eligible at the given threshold (AnnScore >= minAnnScore),
 * enriched with contact + location info for the bank.
 * @param {number} minAnnScore
 * @returns {Promise<object[]>}
 */
const getEligibleFarmers = (minAnnScore) =>
  CropCycle.aggregate([
    ...farmerScoreStages(),
    { $match: { annScore: { $gte: minAnnScore } } },
    { $lookup: { from: 'farmers', localField: '_id', foreignField: '_id', as: 'farmer' } },
    { $unwind: '$farmer' },
    {
      $project: {
        _id: 0,
        farmerId: '$_id',
        name: '$farmer.name',
        phone: '$farmer.phone',
        state: '$farmer.state',
        district: '$farmer.district',
        village: '$farmer.village',
        landArea: '$farmer.landArea',
        landUnit: '$farmer.landUnit',
        primaryCrop: '$farmer.primaryCrop',
        annScore: 1,
        cropHealth: 1,
        bestAnnScore: 1,
        cyclesCount: 1,
        crops: 1,
        predictedYield: { $round: ['$predictedYield', 1] },
        lastActivity: 1,
      },
    },
    { $sort: { annScore: -1 } },
  ]);

/**
 * Dashboard summary numbers for a given threshold.
 * @returns {Promise<{ totalScoredFarmers, eligibleCount, averageAnnScore, threshold }>}
 */
const getSummary = async (minAnnScore) => {
  const [row] = await CropCycle.aggregate([
    ...farmerScoreStages(),
    {
      $group: {
        _id: null,
        totalScoredFarmers: { $sum: 1 },
        averageAnnScore: { $avg: '$annScore' },
        eligibleCount: {
          $sum: { $cond: [{ $gte: ['$annScore', minAnnScore] }, 1, 0] },
        },
      },
    },
  ]);

  return {
    threshold: minAnnScore,
    totalScoredFarmers: row?.totalScoredFarmers || 0,
    eligibleCount: row?.eligibleCount || 0,
    averageAnnScore: row ? Math.round(row.averageAnnScore * 10) / 10 : null,
  };
};

/**
 * Build a plain-language explanation of WHY the farmer earned their AnnScore.
 */
const buildExplanation = ({ annScore, cropHealth, scoredCyclesCount }) => {
  if (annScore == null) {
    return {
      headline: 'No AnnScore yet',
      text: 'This farmer has not submitted any analyzed crop phases, so no AnnScore can be computed.',
      factors: [],
    };
  }
  const weatherWeight = env.score.weatherWeight;
  const wPct = Math.round(weatherWeight * 100);
  const hPct = 100 - wPct;

  return {
    headline: `AnnScore ${annScore} — ${scoreLabel(annScore)}`,
    text:
      `The AnnScore of ${annScore}/100 (${scoreLabel(annScore)}) is the average across this farmer's ` +
      `${scoredCyclesCount} analyzed crop cycle(s). Each cycle's score is the average of its weekly phases, ` +
      `and every phase blends AI-assessed crop health from field photos (${hPct}% weight) with local weather ` +
      `favourability (${wPct}% weight). Disease/stress severity is derived from crop health and factored into the yield estimate.`,
    factors: [
      {
        label: 'Crop health (vision AI)',
        detail: `Averaged ${cropHealth ?? '—'}/100 across submitted phases — the dominant factor (${hPct}% of the score), measured from crop imagery.`,
      },
      {
        label: 'Weather favourability',
        detail: `Contributes ${wPct}% of the score, from temperature, wind and recent rainfall at the field's GPS location.`,
      },
      {
        label: 'Track record',
        detail: `Based on ${scoredCyclesCount} analyzed cycle(s); more consistent, higher phase scores lift the AnnScore.`,
      },
    ],
  };
};

/**
 * Full scoring report for one farmer, justifying their AnnScore with the
 * per-cycle / per-phase breakdown. Used by the bank dashboard drill-down.
 * @returns {Promise<object|null>}
 */
const getFarmerReport = async (farmerId) => {
  const farmer = await Farmer.findById(farmerId).select(
    'name phone state district village landArea landUnit primaryCrop irrigationType'
  );
  if (!farmer) return null;

  const cycleDocs = await CropCycle.find({ farmer: farmerId }).sort({ createdAt: -1 }).lean();

  const cycles = cycleDocs.map((c) => {
    const scored = (c.phases || []).filter((p) => typeof p.annScore === 'number');
    return {
      cycleId: c._id,
      cropLabel: c.cropLabel,
      sowingDate: c.sowingDate,
      durationDays: c.durationDays,
      totalPhases: c.totalPhases,
      status: c.status,
      finalYield: c.finalYield,
      cycleAnnScore: scored.length ? round1(mean(scored.map((p) => p.annScore))) : null,
      cycleCropHealth: scored.length ? round1(mean(scored.map((p) => p.cropHealthScore))) : null,
      phases: (c.phases || []).slice().sort((a, b) => a.phaseNumber - b.phaseNumber),
    };
  });

  const scoredCycles = cycles.filter((c) => c.cycleAnnScore != null);
  const annScore = scoredCycles.length ? round1(mean(scoredCycles.map((c) => c.cycleAnnScore))) : null;
  const cropHealth = scoredCycles.length
    ? round1(mean(scoredCycles.map((c) => c.cycleCropHealth)))
    : null;

  return {
    farmer,
    annScore,
    cropHealth,
    scoreLabel: scoreLabel(annScore),
    cyclesCount: cycles.length,
    scoredCyclesCount: scoredCycles.length,
    totalPhases: cycles.reduce((n, c) => n + c.phases.length, 0),
    explanation: buildExplanation({ annScore, cropHealth, scoredCyclesCount: scoredCycles.length }),
    cycles,
  };
};

module.exports = { setCriteria, getEligibleFarmers, getSummary, getFarmerReport };
