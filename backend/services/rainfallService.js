/**
 * Rainfall-history service.
 *
 * Fetches recent daily precipitation for a field's coordinates from the
 * Open-Meteo **archive** (reanalysis) API — the correct source for historical
 * rainfall, and on a separate quota from the live forecast endpoint. The
 * archive lags a few days, so we query a window ending ~5 days ago.
 *
 * Results are cached per location. Like weather, this is enrichment — a failure
 * returns `{ available: false }` rather than aborting the analysis.
 */
const axios = require('axios');
const env = require('../config/env');

// Archive reanalysis typically lags ~5 days behind "today".
const ARCHIVE_LAG_DAYS = 5;

// --- Small in-memory TTL cache keyed by rounded coordinates ---
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 h (rainfall history changes slowly)
const cache = new Map();
const keyFor = (lat, lon) => `${lat.toFixed(2)},${lon.toFixed(2)}`;

const fmtDate = (d) => d.toISOString().slice(0, 10);

// Total-rainfall bands (mm) over the lookback window -> qualitative adequacy.
const classifyAdequacy = (totalMm, days) => {
  const perWeek = (totalMm / days) * 7;
  if (perWeek < 5) return 'low'; // dry spell
  if (perWeek > 80) return 'high'; // waterlogging risk
  return 'adequate';
};

/**
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} normalized rainfall summary (never throws).
 */
const getRainfallHistory = async (latitude, longitude) => {
  const key = keyFor(latitude, longitude);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const days = env.rainfall.lookbackDays;
  const end = new Date();
  end.setDate(end.getDate() - ARCHIVE_LAG_DAYS);
  const start = new Date(end);
  start.setDate(start.getDate() - days);

  try {
    const { data } = await axios.get(env.weather.archiveUrl, {
      params: {
        latitude,
        longitude,
        start_date: fmtDate(start),
        end_date: fmtDate(end),
        daily: 'precipitation_sum',
        timezone: 'auto',
      },
      timeout: env.weather.timeoutMs,
    });

    const series = (data && data.daily && data.daily.precipitation_sum) || null;
    if (!series || series.length === 0) {
      return { available: false, source: 'open-meteo-archive' };
    }

    const values = series.filter((v) => typeof v === 'number');
    const totalMm = Math.round(values.reduce((a, b) => a + b, 0) * 10) / 10;
    const rainyDays = values.filter((v) => v >= 1).length;

    const value = {
      available: true,
      source: 'open-meteo-archive',
      windowDays: values.length,
      totalMm,
      rainyDays,
      averageDailyMm: Math.round((totalMm / values.length) * 100) / 100,
      adequacy: classifyAdequacy(totalMm, values.length),
    };
    cache.set(key, { at: Date.now(), value });
    return value;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  Rainfall fetch failed (${key}):`, err.message);
    return { available: false, source: 'open-meteo-archive' };
  }
};

module.exports = { getRainfallHistory, classifyAdequacy };
