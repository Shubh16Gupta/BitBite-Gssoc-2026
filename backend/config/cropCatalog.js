/**
 * Crop catalog — the reference data that drives growth-phase timing and the
 * baseline yield in the rule-based yield engine.
 *
 * For each crop:
 *   - minDays / maxDays : typical field duration; the midpoint becomes the crop
 *                         cycle's total length, divided into 4 growth phases.
 *   - avgYieldPerAcre   : average productivity (quintals/acre) used as the
 *                         yield baseline (1 quintal = 100 kg).
 *   - stages            : optional 4 stage names (one per phase); falls back to
 *                         generic stage names when omitted.
 *
 * These are broad averages meant to be tuned to a region — edit freely. This is
 * intentionally a plain config file (not a DB) so it can be reviewed and swapped
 * without a migration.
 */

// Generic stage names used when a crop doesn't define its own.
const DEFAULT_STAGES = ['Establishment', 'Vegetative', 'Flowering / Fruiting', 'Maturity / Harvest'];

const CROPS = {
  tomato: { label: 'Tomato', minDays: 60, maxDays: 90, avgYieldPerAcre: 120,
    stages: ['Seedling', 'Vegetative', 'Flowering & Fruit set', 'Ripening / Harvest'] },
  wheat: { label: 'Wheat', minDays: 120, maxDays: 150, avgYieldPerAcre: 18,
    stages: ['Germination / Tillering', 'Stem elongation', 'Heading / Flowering', 'Grain fill / Harvest'] },
  rice: { label: 'Rice', minDays: 120, maxDays: 150, avgYieldPerAcre: 22,
    stages: ['Seedling / Tillering', 'Vegetative', 'Panicle / Flowering', 'Ripening / Harvest'] },
  cotton: { label: 'Cotton', minDays: 150, maxDays: 180, avgYieldPerAcre: 8,
    stages: ['Establishment', 'Vegetative', 'Flowering / Boll formation', 'Boll opening / Harvest'] },
  maize: { label: 'Maize (Corn)', minDays: 90, maxDays: 110, avgYieldPerAcre: 25,
    stages: ['Emergence', 'Vegetative', 'Tasseling / Silking', 'Grain fill / Harvest'] },
  potato: { label: 'Potato', minDays: 90, maxDays: 120, avgYieldPerAcre: 100,
    stages: ['Sprouting', 'Vegetative', 'Tuber initiation', 'Tuber bulking / Harvest'] },
  onion: { label: 'Onion', minDays: 100, maxDays: 120, avgYieldPerAcre: 120,
    stages: ['Establishment', 'Vegetative', 'Bulb initiation', 'Bulb maturity / Harvest'] },
  soybean: { label: 'Soybean', minDays: 90, maxDays: 110, avgYieldPerAcre: 12 },
  groundnut: { label: 'Groundnut', minDays: 100, maxDays: 130, avgYieldPerAcre: 10 },
  sugarcane: { label: 'Sugarcane', minDays: 300, maxDays: 360, avgYieldPerAcre: 350 },
  mustard: { label: 'Mustard', minDays: 110, maxDays: 140, avgYieldPerAcre: 8 },
  chilli: { label: 'Chilli', minDays: 120, maxDays: 150, avgYieldPerAcre: 40 },
};

const YIELD_UNIT = 'quintals';

/** Normalize a user-supplied crop name to a catalog key. */
const normalizeKey = (cropType) =>
  String(cropType || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

/**
 * Resolve a crop entry (with computed durationDays + resolved stages).
 * @returns {object|null} crop details, or null if unknown.
 */
const getCrop = (cropType) => {
  const key = normalizeKey(cropType);
  const entry = CROPS[key];
  if (!entry) return null;

  const durationDays = Math.round((entry.minDays + entry.maxDays) / 2);
  return {
    key,
    label: entry.label,
    minDays: entry.minDays,
    maxDays: entry.maxDays,
    durationDays,
    avgYieldPerAcre: entry.avgYieldPerAcre,
    yieldUnit: YIELD_UNIT,
    stages: entry.stages && entry.stages.length === 4 ? entry.stages : DEFAULT_STAGES,
  };
};

/** List all supported crops (for a selection endpoint). */
const listCrops = () =>
  Object.keys(CROPS).map((key) => {
    const c = getCrop(key);
    return {
      key,
      label: c.label,
      minDays: c.minDays,
      maxDays: c.maxDays,
      durationDays: c.durationDays,
      avgYieldPerAcre: c.avgYieldPerAcre,
      yieldUnit: c.yieldUnit,
    };
  });

module.exports = { getCrop, listCrops, DEFAULT_STAGES, YIELD_UNIT };
