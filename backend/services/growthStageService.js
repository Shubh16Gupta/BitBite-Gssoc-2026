/**
 * Growth-stage service.
 *
 * A crop cycle's total duration (from the catalog) is divided into 4 equal
 * growth phases. This service builds the phase schedule (date ranges + stage
 * names) and reports the stage + prediction confidence for a given phase.
 *
 * Confidence rises through the cycle — an early-stage yield estimate is far less
 * certain than one made near harvest.
 */

const TOTAL_PHASES = 4;

// Prediction confidence (%) by phase index (1-based).
const PHASE_CONFIDENCE = { 1: 40, 2: 60, 3: 75, 4: 95 };

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Build the 4-phase schedule for a crop cycle.
 * @param {Date|string} sowingDate
 * @param {number} durationDays
 * @returns {Array<{phaseNumber, stageName, startDay, endDay, startDate, endDate, confidence}>}
 */
const buildPhaseSchedule = (sowingDate, durationDays, stages) => {
  const start = new Date(sowingDate);
  const phaseLength = durationDays / TOTAL_PHASES;

  return Array.from({ length: TOTAL_PHASES }, (_, i) => {
    const phaseNumber = i + 1;
    const startDay = Math.round(i * phaseLength);
    const endDay = Math.round((i + 1) * phaseLength);
    return {
      phaseNumber,
      stageName: stages[i],
      startDay,
      endDay,
      startDate: addDays(start, startDay),
      endDate: addDays(start, endDay),
      confidence: PHASE_CONFIDENCE[phaseNumber],
    };
  });
};

/**
 * Stage info for a specific phase number, using a prebuilt schedule.
 */
const getPhaseInfo = (schedule, phaseNumber) =>
  schedule.find((p) => p.phaseNumber === phaseNumber) || null;

/**
 * Which phase does `date` fall into, given the schedule? Clamped to [1, 4].
 * Useful to suggest the "current" phase to the farmer.
 */
const phaseForDate = (schedule, date = new Date()) => {
  const t = new Date(date).getTime();
  for (const phase of schedule) {
    if (t < new Date(phase.endDate).getTime()) return phase.phaseNumber;
  }
  return TOTAL_PHASES;
};

/** Overall crop progress (0–100%) at a given date. */
const progressPercent = (sowingDate, durationDays, date = new Date()) => {
  const elapsed = (new Date(date).getTime() - new Date(sowingDate).getTime()) / 86400000;
  return Math.max(0, Math.min(100, Math.round((elapsed / durationDays) * 100)));
};

module.exports = {
  TOTAL_PHASES,
  PHASE_CONFIDENCE,
  buildPhaseSchedule,
  getPhaseInfo,
  phaseForDate,
  progressPercent,
};
