/**
 * Yield Prediction Service — rule-based engine (MVP).
 *
 * There is no trained yield model or historical dataset yet, so this computes a
 * transparent, explainable estimate from public agronomic averages (crop base
 * yield) adjusted by AI-derived crop health, disease severity, and weather. It
 * is deliberately isolated behind a single `predict(input)` function so it can
 * be swapped for a trained ML model later WITHOUT changing any caller:
 *
 *     const { estimatedYield, unit, confidence, factorsUsed, explanation }
 *       = predict(input);
 *
 * Formula:
 *   baseline        = farmSizeAcres × avgYieldPerAcre
 *   estimatedYield  = baseline × healthMultiplier × diseaseMultiplier × weatherMultiplier
 *   confidence      = f(growth stage)   // rises toward harvest
 */
const scoreService = require('./scoreService');

const HECTARE_TO_ACRE = 2.47105;

// --- Adjustment tables (edit to re-tune the engine) ---

const healthMultiplier = (score) => {
  if (score >= 90) return 1.1;
  if (score >= 80) return 1.05;
  if (score >= 60) return 1.0;
  if (score >= 40) return 0.9;
  return 0.75;
};

const DISEASE_MULTIPLIER = { none: 1.0, low: 0.95, medium: 0.85, high: 0.7 };

const WEATHER_MULTIPLIER = { favourable: 1.05, normal: 1.0, poor: 0.9, extreme: 0.75 };

const round = (n, d = 2) => {
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

/**
 * Classify overall weather into favourable | normal | poor | extreme, combining
 * the current-weather favorability with recent rainfall adequacy.
 * @param {object} weather - weather sub-document (may be unavailable).
 * @param {object} rainfall - rainfall summary (may be unavailable).
 */
const classifyWeather = (weather, rainfall) => {
  const weatherScore = scoreService.computeWeatherScore(weather); // 0–100 or null

  let category;
  if (weatherScore == null) category = 'normal';
  else if (weatherScore >= 85) category = 'favourable';
  else if (weatherScore >= 60) category = 'normal';
  else if (weatherScore >= 40) category = 'poor';
  else category = 'extreme';

  // Rainfall stress can downgrade an otherwise fine outlook.
  if (rainfall && rainfall.available && rainfall.adequacy !== 'adequate') {
    const order = ['favourable', 'normal', 'poor', 'extreme'];
    const idx = Math.min(order.length - 1, order.indexOf(category) + 1);
    category = order[idx];
  }
  return category;
};

/** Convert a farm size to acres for the baseline calculation. */
const toAcres = (size, unit) => (unit === 'hectare' ? size * HECTARE_TO_ACRE : size);

/**
 * Predict yield. This is the stable public interface — keep the signature when
 * replacing the internals with an ML model.
 *
 * @param {object} input
 * @param {string} input.cropType
 * @param {number} input.avgYieldPerAcre  - crop baseline (quintals/acre).
 * @param {number} input.farmSize
 * @param {string} input.farmSizeUnit      - 'acre' | 'hectare'
 * @param {number} input.healthScore       - crop health 0–100 (from the vision AI).
 * @param {string} input.growthStage       - stage name for context.
 * @param {number} input.confidence        - stage-based confidence (%).
 * @param {object} input.weather           - weather sub-document.
 * @param {object} input.rainfall          - rainfall summary.
 * @param {string} [input.diseaseSeverity] - 'none' | 'low' | 'medium' | 'high' (default 'none').
 * @param {string} [input.healthTrend]     - 'improving' | 'declining' | 'stable' (context only).
 * @param {string} [input.unit]            - yield unit label (default 'quintals').
 * @returns {{estimatedYield:number, unit:string, confidence:number, factorsUsed:object, explanation:string}}
 */
const predict = (input) => {
  const {
    cropType,
    avgYieldPerAcre,
    farmSize,
    farmSizeUnit = 'acre',
    healthScore,
    growthStage,
    confidence,
    weather,
    rainfall,
    diseaseSeverity = 'none',
    healthTrend = null,
    unit = 'quintals',
  } = input;

  const farmSizeAcres = round(toAcres(farmSize, farmSizeUnit), 3);
  const baselineYield = round(farmSizeAcres * avgYieldPerAcre);

  const weatherCategory = classifyWeather(weather, rainfall);

  const hMult = healthMultiplier(healthScore);
  const dMult = DISEASE_MULTIPLIER[diseaseSeverity] ?? 1.0;
  const wMult = WEATHER_MULTIPLIER[weatherCategory] ?? 1.0;

  const estimatedYield = round(baselineYield * hMult * dMult * wMult);

  const factorsUsed = {
    cropType,
    farmSize,
    farmSizeUnit,
    farmSizeAcres,
    avgYieldPerAcre,
    baselineYield,
    healthScore,
    healthMultiplier: hMult,
    diseaseSeverity,
    diseaseMultiplier: dMult,
    weatherCategory,
    weatherMultiplier: wMult,
    growthStage,
    healthTrend,
  };

  const explanation =
    `Estimated yield is based on average regional productivity for ${cropType} ` +
    `(${avgYieldPerAcre} ${unit}/acre × ${farmSizeAcres} acres = ${baselineYield} ${unit} baseline), ` +
    `adjusted using current crop health (${healthScore}/100 → ×${hMult}), ` +
    `detected disease severity (${diseaseSeverity} → ×${dMult}), and ` +
    `recent weather conditions (${weatherCategory} → ×${wMult}). ` +
    `This is an estimate only and becomes more accurate as weekly monitoring data ` +
    `accumulates (current confidence ${confidence}% at the ${growthStage} stage).`;

  return { estimatedYield, unit, confidence, factorsUsed, explanation };
};

module.exports = {
  predict,
  classifyWeather,
  // Exposed for testing / future re-tuning.
  healthMultiplier,
  DISEASE_MULTIPLIER,
  WEATHER_MULTIPLIER,
};
