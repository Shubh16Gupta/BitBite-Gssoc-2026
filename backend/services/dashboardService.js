/**
 * Dashboard service.
 *
 * Read-only aggregations over WeeklyAnalysis for a single field. Queries are
 * scoped to the owning farmer and lean on MongoDB's aggregation pipeline so the
 * database does the counting/averaging work in one round-trip instead of
 * pulling every document into Node.
 */
const WeeklyAnalysis = require('../models/WeeklyAnalysis');

/**
 * Round to 2 decimals, or return null for a missing value.
 */
const round2 = (n) => (typeof n === 'number' ? Math.round(n * 100) / 100 : null);

/**
 * Build the full dashboard payload for a field.
 *
 * A single `$facet` pipeline returns both the summary stats and the
 * week-sorted list of analyses, so we hit the collection just once.
 *
 * @param {object} field - the owned Field document (has _id).
 * @param {import('mongoose').Types.ObjectId} farmerId
 * @returns {Promise<object>}
 */
const getDashboard = async (field, farmerId) => {
  const [result] = await WeeklyAnalysis.aggregate([
    { $match: { field: field._id, farmer: farmerId } },
    {
      $facet: {
        // Summary statistics computed in-database.
        stats: [
          {
            $group: {
              _id: null,
              totalUploads: { $sum: 1 },
              averageAnnScore: { $avg: '$annScore' },
              highestAnnScore: { $max: '$annScore' },
              lowestAnnScore: { $min: '$annScore' },
            },
          },
        ],
        // Full list, newest week first — drives current + previous slices.
        analyses: [{ $sort: { weekNumber: -1 } }],
      },
    },
  ]);

  const stats = (result.stats && result.stats[0]) || {};
  const analyses = result.analyses || [];

  // The most recent week is the "current" one; everything else is "previous".
  const [current, ...previous] = analyses;

  return {
    fieldId: field._id,
    fieldName: field.fieldName,
    currentWeek: current ? current.weekNumber : null,
    currentAnnScore: current ? current.annScore : null,
    latestWeather: current ? current.weather : null,
    totalUploads: stats.totalUploads || 0,
    averageAnnScore: round2(stats.averageAnnScore),
    highestAnnScore: stats.highestAnnScore ?? null,
    lowestAnnScore: stats.lowestAnnScore ?? null,
    previousWeeklyAnalyses: previous,
  };
};

/**
 * Return every analysis for a field as { week, annScore }, sorted by week asc.
 * Projection + sort happen in the pipeline so only the two needed fields travel
 * over the wire.
 *
 * @param {object} field
 * @param {import('mongoose').Types.ObjectId} farmerId
 * @returns {Promise<Array<{ week: number, annScore: number }>>}
 */
const getHistory = (field, farmerId) =>
  WeeklyAnalysis.aggregate([
    { $match: { field: field._id, farmer: farmerId } },
    { $sort: { weekNumber: 1 } },
    { $project: { _id: 0, week: '$weekNumber', annScore: 1 } },
  ]);

/**
 * Build the AnnScore timeline that powers the dashboard chart.
 *
 * The week-ordered series is fetched with a single lean aggregation (only the
 * two needed fields). Sequential metrics — week-over-week difference and
 * percentage change — are derived in one pass in Node, since each depends on the
 * preceding point. Overall average and growth trend are computed alongside.
 *
 * Percentage change = ((current - previous) / previous) * 100.
 *
 * @param {object} field - the owned Field document (has _id, fieldName).
 * @param {import('mongoose').Types.ObjectId} farmerId
 * @returns {Promise<object>}
 */
const getGraph = async (field, farmerId) => {
  const rows = await WeeklyAnalysis.aggregate([
    { $match: { field: field._id, farmer: farmerId } },
    { $sort: { weekNumber: 1 } },
    { $project: { _id: 0, week: '$weekNumber', annScore: 1 } },
  ]);

  let sum = 0;
  const timeline = rows.map((row, i) => {
    sum += row.annScore;

    // Week-over-week deltas (null for the first point — no prior week).
    let difference = null;
    let percentageChange = null;
    if (i > 0) {
      const previous = rows[i - 1].annScore;
      difference = round2(row.annScore - previous);
      percentageChange = previous !== 0 ? round2(((row.annScore - previous) / previous) * 100) : null;
    }

    return { week: row.week, annScore: row.annScore, difference, percentageChange };
  });

  const count = rows.length;
  const averageAnnScore = count ? round2(sum / count) : null;

  // Growth trend: net movement from the first recorded week to the latest.
  let growthTrend = 'insufficient-data';
  let overallChange = null;
  let overallPercentageChange = null;
  if (count >= 2) {
    const first = rows[0].annScore;
    const last = rows[count - 1].annScore;
    overallChange = round2(last - first);
    overallPercentageChange = first !== 0 ? round2(((last - first) / first) * 100) : null;
    if (last > first) growthTrend = 'improving';
    else if (last < first) growthTrend = 'declining';
    else growthTrend = 'stable';
  }

  return {
    fieldId: field._id,
    fieldName: field.fieldName,
    averageAnnScore,
    growthTrend,
    overallChange,
    overallPercentageChange,
    timeline,
  };
};

module.exports = { getDashboard, getHistory, getGraph };
