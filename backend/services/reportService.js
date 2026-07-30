/**
 * Report service.
 *
 * Assembles a structured "farm report" for a completed phase from the pipeline
 * outputs (crop health, weather, rainfall, growth stage, health trend, yield
 * estimate) and derives rule-based recommendations + a human summary. The report
 * is stored on the phase and also returned to the client.
 */
const { scoreLabelFor } = (() => {
  const scoreLabelFor = (score) => {
    if (score == null) return 'no data';
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'healthy';
    if (score >= 50) return 'needs attention';
    return 'at risk';
  };
  return { scoreLabelFor };
})();

/** Rule-based recommendations from the phase signals. */
const buildRecommendations = ({ healthScore, healthTrend, weather, rainfall, weatherCategory }) => {
  const recs = [];

  if (healthScore < 50) {
    recs.push('Crop health is low — inspect for pest/nutrient stress and consider corrective action.');
  } else if (healthScore < 70) {
    recs.push('Crop health is moderate — monitor closely and maintain nutrient/irrigation schedule.');
  } else {
    recs.push('Crop health is strong — continue the current management practices.');
  }

  if (healthTrend === 'declining') {
    recs.push('Health has declined versus the previous phase — investigate the cause promptly.');
  } else if (healthTrend === 'improving') {
    recs.push('Health is improving versus the previous phase — current practices are working.');
  }

  if (rainfall && rainfall.available) {
    if (rainfall.adequacy === 'low') {
      recs.push('Recent rainfall is low — ensure adequate irrigation to avoid water stress.');
    } else if (rainfall.adequacy === 'high') {
      recs.push('Recent rainfall is high — check drainage to reduce waterlogging and disease risk.');
    }
  }

  if (weatherCategory === 'extreme' || weatherCategory === 'poor') {
    recs.push('Weather conditions are unfavourable — take protective measures where possible.');
  }

  return recs;
};

/**
 * Generate the phase farm report.
 * @param {object} args
 * @returns {object} structured report.
 */
const generatePhaseReport = (args) => {
  const {
    cropLabel,
    phaseNumber,
    totalPhases,
    stageName,
    confidence,
    progressPct,
    healthScore,
    annScore,
    healthTrend,
    weather,
    rainfall,
    weatherCategory,
    yieldPrediction,
    marketPrice,
    estimatedRevenue,
    isFinalPhase,
  } = args;

  const recommendations = buildRecommendations({
    healthScore,
    healthTrend,
    weather,
    rainfall,
    weatherCategory,
  });

  const weatherSummary = weather && weather.available
    ? `${Math.round(weather.temperatureC)}°C, ${weather.description}, wind ${weather.windSpeedKph} km/h`
    : 'unavailable';

  const rainfallSummary = rainfall && rainfall.available
    ? `${rainfall.totalMm} mm over ${rainfall.windowDays} days (${rainfall.adequacy})`
    : 'unavailable';

  const marketSummary =
    marketPrice && estimatedRevenue != null
      ? ` Estimated value ₹${estimatedRevenue.toLocaleString('en-IN')} ` +
        `(at ₹${marketPrice.modalPrice}/quintal, ${marketPrice.source}).`
      : '';

  const summary =
    `${cropLabel} — Phase ${phaseNumber}/${totalPhases} (${stageName}). ` +
    `Crop health ${healthScore}/100 (${scoreLabelFor(healthScore)}, trend: ${healthTrend || 'n/a'}). ` +
    `Weather ${weatherCategory}; rainfall ${rainfallSummary}. ` +
    `${isFinalPhase ? 'Final' : 'Interim'} yield estimate ` +
    `${yieldPrediction.estimatedYield} ${yieldPrediction.unit} at ${yieldPrediction.confidence}% confidence.` +
    marketSummary;

  return {
    generatedAt: new Date(),
    crop: cropLabel,
    phase: { number: phaseNumber, of: totalPhases, stage: stageName, progressPct, confidence },
    cropHealth: { score: healthScore, blendedScore: annScore, label: scoreLabelFor(healthScore), trend: healthTrend },
    weather: { category: weatherCategory, summary: weatherSummary, raw: weather },
    rainfall: { summary: rainfallSummary, raw: rainfall },
    yield: yieldPrediction,
    market: marketPrice || null,
    estimatedRevenue: estimatedRevenue != null ? estimatedRevenue : null,
    recommendations,
    summary,
    isFinalPhase: Boolean(isFinalPhase),
  };
};

module.exports = { generatePhaseReport, scoreLabelFor };
