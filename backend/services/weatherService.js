/**
 * Weather integration.
 *
 * Fetches current weather for a field's coordinates with a resilient fallback
 * chain, so a single provider being down or rate-limited doesn't blank the
 * report:
 *   1. Open-Meteo  (free, key-less; primary)
 *   2. wttr.in     (free, key-less; fallback)
 *
 * Results are cached briefly per location so submitting several phases in a row
 * doesn't hammer the providers. Weather is enrichment — total failure returns
 * `{ available: false }` rather than aborting the analysis.
 */
const axios = require('axios');
const env = require('../config/env');

// WMO weather-code -> description (Open-Meteo `weathercode`).
const WEATHER_CODE_DESCRIPTIONS = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
  66: 'Light freezing rain', 67: 'Heavy freezing rain', 71: 'Slight snow',
  73: 'Moderate snow', 75: 'Heavy snow', 80: 'Slight rain showers',
  81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail',
};

// --- Small in-memory TTL cache keyed by rounded coordinates ---
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min
const cache = new Map();
const keyFor = (lat, lon) => `${lat.toFixed(2)},${lon.toFixed(2)}`;

/** Primary provider: Open-Meteo current weather. */
const fromOpenMeteo = async (latitude, longitude) => {
  const { data } = await axios.get(env.weather.baseUrl, {
    params: { latitude, longitude, current_weather: true },
    timeout: env.weather.timeoutMs,
  });
  if (!data || data.error || !data.current_weather) {
    throw new Error(data?.reason || 'No current_weather in response');
  }
  const c = data.current_weather;
  return {
    available: true,
    source: 'open-meteo',
    temperatureC: c.temperature,
    windSpeedKph: c.windspeed,
    windDirectionDeg: c.winddirection,
    weatherCode: c.weathercode,
    description: WEATHER_CODE_DESCRIPTIONS[c.weathercode] || 'Unknown',
    observedAt: c.time ? new Date(c.time) : new Date(),
  };
};

/** Fallback provider: wttr.in current conditions. */
const fromWttr = async (latitude, longitude) => {
  const { data } = await axios.get(`https://wttr.in/${latitude},${longitude}`, {
    params: { format: 'j1' },
    timeout: env.weather.timeoutMs,
    headers: { 'User-Agent': 'curl/8' }, // wttr.in serves JSON to curl-like agents
  });
  const c = data && data.current_condition && data.current_condition[0];
  if (!c) throw new Error('No current_condition in wttr.in response');
  return {
    available: true,
    source: 'wttr.in',
    temperatureC: Number(c.temp_C),
    windSpeedKph: Number(c.windspeedKmph),
    windDirectionDeg: Number(c.winddirDegree),
    weatherCode: null,
    description: (c.weatherDesc && c.weatherDesc[0] && c.weatherDesc[0].value) || 'Unknown',
    observedAt: new Date(),
  };
};

/**
 * Fetch current weather for a latitude/longitude (never throws).
 * @returns {Promise<object>} normalized weather object.
 */
const getCurrentWeather = async (latitude, longitude) => {
  const key = keyFor(latitude, longitude);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const providers = [fromOpenMeteo, fromWttr];
  for (const provider of providers) {
    try {
      const value = await provider(latitude, longitude);
      cache.set(key, { at: Date.now(), value });
      return value;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Weather via ${provider.name} failed (${key}):`, err.message);
    }
  }
  return { available: false, source: 'none' };
};

module.exports = { getCurrentWeather };
