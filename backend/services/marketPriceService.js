/**
 * Market-price service.
 *
 * Fetches current mandi (APMC) prices from the Government of India open-data
 * platform (data.gov.in) — the same Agmarknet feed — to value a farmer's
 * predicted yield. Prices are modal ₹/quintal.
 *
 * Resilience: results are cached per crop+state for 6h, and if the API is
 * unavailable (or a crop isn't found) we fall back to a reference price table so
 * a revenue estimate is always produced. Never throws.
 */
const axios = require('axios');
const env = require('../config/env');

// Catalog crop key -> Agmarknet commodity name.
const COMMODITY = {
  tomato: 'Tomato', wheat: 'Wheat', rice: 'Rice', cotton: 'Cotton', maize: 'Maize',
  potato: 'Potato', onion: 'Onion', soybean: 'Soyabean', groundnut: 'Groundnut',
  sugarcane: 'Sugarcane', mustard: 'Mustard', chilli: 'Green Chilli',
};

// Fallback modal prices (₹/quintal) — rough national averages, used when the API
// is unreachable or returns nothing for the crop.
const REFERENCE_PRICE = {
  tomato: 1800, wheat: 2400, rice: 2200, cotton: 7000, maize: 2000, potato: 1300,
  onion: 1800, soybean: 4500, groundnut: 6500, sugarcane: 350, mustard: 5500, chilli: 9000,
};

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6h
const cache = new Map();

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

/** Query the data.gov.in Agmarknet resource for a commodity (optionally by state). */
const fetchFromAgmarknet = async (commodity, state) => {
  const params = {
    'api-key': env.market.apiKey,
    format: 'json',
    limit: 100,
    'filters[commodity]': commodity,
  };
  if (state) params['filters[state]'] = state;

  const { data } = await axios.get(env.market.baseUrl, { params, timeout: env.market.timeoutMs });
  const records = (data && data.records) || [];
  const prices = records.map((r) => Number(r.modal_price)).filter((n) => Number.isFinite(n) && n > 0);
  if (prices.length === 0) return null;

  const mins = records.map((r) => Number(r.min_price)).filter((n) => n > 0);
  const maxs = records.map((r) => Number(r.max_price)).filter((n) => n > 0);
  const sample = records[0] || {};

  return {
    modalPrice: median(prices),
    minPrice: mins.length ? Math.round(Math.min(...mins)) : null,
    maxPrice: maxs.length ? Math.round(Math.max(...maxs)) : null,
    unit: '₹/quintal',
    market: sample.market || null,
    state: state || sample.state || null,
    arrivalDate: sample.arrival_date || null,
    samples: records.length,
    source: 'agmarknet',
  };
};

/**
 * Get the modal price for a catalog crop key (e.g. 'tomato'), optionally scoped
 * to a state. Returns null only if the crop is completely unknown.
 * @returns {Promise<object|null>}
 */
const getPrice = async (cropKey, state) => {
  const key = `${cropKey}|${state || 'all'}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const commodity = COMMODITY[cropKey];
  let value = null;

  if (commodity && env.market.apiKey) {
    try {
      value = await fetchFromAgmarknet(commodity, state);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  Market price fetch failed (${cropKey}):`, err.message);
    }
  }

  if (!value) {
    const ref = REFERENCE_PRICE[cropKey];
    value = ref
      ? {
          modalPrice: ref,
          minPrice: Math.round(ref * 0.85),
          maxPrice: Math.round(ref * 1.15),
          unit: '₹/quintal',
          market: null,
          state: state || null,
          arrivalDate: null,
          samples: 0,
          source: 'reference',
        }
      : null;
  }

  if (value) cache.set(key, { at: Date.now(), value });
  return value;
};

/**
 * Compute an estimated gross revenue from a predicted yield (quintals).
 * @returns {{ estimatedRevenue: number, currency: string }|null}
 */
const estimateRevenue = (estimatedYieldQuintals, price) => {
  if (!price || typeof estimatedYieldQuintals !== 'number') return null;
  return { estimatedRevenue: Math.round(estimatedYieldQuintals * price.modalPrice), currency: 'INR' };
};

module.exports = { getPrice, estimateRevenue, COMMODITY, REFERENCE_PRICE };
