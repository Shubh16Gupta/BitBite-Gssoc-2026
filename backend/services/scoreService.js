/**
 * Score composition.
 *
 * The final AnnScore blends two signals:
 *   1. cropHealthScore — the vision model's field health (0–100), from the ML service.
 *   2. weatherScore    — how favorable the current weather is for the crop (0–100),
 *                        derived here from the Open-Meteo reading captured at upload.
 *
 *   annScore = (1 - w) * cropHealthScore + w * weatherScore
 *
 * where `w` is env.score.weatherWeight. If weather is unavailable, the AnnScore
 * falls back to the crop-health score alone. Keeping this here (rather than in
 * the ML service) means the vision model stays weather-agnostic and the blend
 * is transparent, tunable business logic next to the weather data.
 */
const env = require('../config/env');

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value, ndigits = 2) => {
  const f = 10 ** ndigits;
  return Math.round(value * f) / f;
};

// WMO weather codes that are adverse / moderately adverse for crops.
const ADVERSE_CODES = new Set([65, 67, 75, 77, 82, 86, 95, 96, 99]);
const MODERATE_CODES = new Set([45, 48, 63, 73, 81]);

// Comfortable temperature band (°C) within which there is no penalty.
const IDEAL_TEMP_MIN = 18;
const IDEAL_TEMP_MAX = 32;

/**
 * Convert a weather reading into a 0–100 favorability score.
 * @param {object} weather - the WeeklyAnalysis weather sub-document.
 * @returns {number|null} favorability, or null when weather is unavailable.
 */
const computeWeatherScore = (weather) => {
  if (!weather || !weather.available) return null;

  let score = 100;

  // Temperature: penalize deviation outside the comfortable band.
  const t = weather.temperatureC;
  if (typeof t === 'number') {
    const deviation =
      t < IDEAL_TEMP_MIN ? IDEAL_TEMP_MIN - t : t > IDEAL_TEMP_MAX ? t - IDEAL_TEMP_MAX : 0;
    score -= Math.min(45, deviation * 3);
  }

  // Wind: penalize strong winds above 40 km/h.
  const wind = weather.windSpeedKph;
  if (typeof wind === 'number' && wind > 40) {
    score -= Math.min(20, (wind - 40) * 0.5);
  }

  // Sky conditions from the weather code.
  if (ADVERSE_CODES.has(weather.weatherCode)) {
    score -= 25;
  } else if (MODERATE_CODES.has(weather.weatherCode)) {
    score -= 12;
  }

  return clamp(round(score));
};

/**
 * Blend the crop-health score with weather into the final AnnScore.
 * @param {number} cropHealthScore - 0–100 from the vision model.
 * @param {object} weather - weather sub-document.
 * @returns {{ annScore: number, cropHealthScore: number, weatherScore: number|null, weatherWeight: number }}
 */
const composeAnnScore = (cropHealthScore, weather) => {
  const crop = round(cropHealthScore);
  const weatherScore = computeWeatherScore(weather);

  if (weatherScore === null) {
    return { annScore: Math.round(clamp(crop)), cropHealthScore: crop, weatherScore: null, weatherWeight: 0 };
  }

  const w = env.score.weatherWeight;
  const blended = (1 - w) * crop + w * weatherScore;

  return {
    annScore: Math.round(clamp(blended)),
    cropHealthScore: crop,
    weatherScore,
    weatherWeight: w,
  };
};

module.exports = { composeAnnScore, computeWeatherScore };
