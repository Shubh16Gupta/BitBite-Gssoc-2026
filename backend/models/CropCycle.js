const mongoose = require('mongoose');

/**
 * CropCycle model.
 *
 * One planting instance on a field: a crop type sown on a date, whose total
 * growth duration (from the crop catalog) is divided into 4 phases. Each phase
 * the farmer uploads photos; the pipeline runs and appends a phase sub-document.
 * After phase 4, the cycle is completed and a final yield is stored.
 *
 * Phases are embedded (max 4) so the whole cycle — schedule, per-phase analysis,
 * reports, and final yield — reads in a single document.
 */

// Snapshot of a yield prediction (shape mirrors yieldPredictionService output).
const yieldSchema = new mongoose.Schema(
  {
    estimatedYield: { type: Number },
    unit: { type: String, default: 'quintals' },
    confidence: { type: Number },
    factorsUsed: { type: mongoose.Schema.Types.Mixed },
    explanation: { type: String },
  },
  { _id: false }
);

// One growth phase's analysis + report.
const phaseSchema = new mongoose.Schema(
  {
    phaseNumber: { type: Number, required: true, min: 1, max: 4 },
    stageName: { type: String },
    imageUrls: { type: [String], default: [] },

    cropHealthScore: { type: Number, min: 0, max: 100 }, // vision AI
    annScore: { type: Number, min: 0, max: 100 }, // health blended with weather
    healthTrend: { type: String, enum: ['improving', 'declining', 'stable', null], default: null },
    diseaseSeverity: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },

    weather: { type: mongoose.Schema.Types.Mixed },
    rainfall: { type: mongoose.Schema.Types.Mixed },

    yield: { type: yieldSchema },
    report: { type: mongoose.Schema.Types.Mixed },
    analysisMeta: { type: mongoose.Schema.Types.Mixed },

    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const cropCycleSchema = new mongoose.Schema(
  {
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true, index: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },

    // Crop + timing (resolved from the catalog at cycle start).
    cropType: { type: String, required: true }, // catalog key
    cropLabel: { type: String, required: true },
    sowingDate: { type: Date, required: true },
    durationDays: { type: Number, required: true },
    totalPhases: { type: Number, default: 4 },

    // Yield baseline inputs captured at start.
    avgYieldPerAcre: { type: Number, required: true },
    yieldUnit: { type: String, default: 'quintals' },
    farmSize: { type: Number, required: true },
    farmSizeUnit: { type: String, enum: ['acre', 'hectare'], default: 'acre' },

    // Precomputed 4-phase schedule (date ranges + stage names + confidence).
    phaseSchedule: { type: [mongoose.Schema.Types.Mixed], default: [] },

    // Per-phase analyses appended as the farmer uploads.
    phases: { type: [phaseSchema], default: [] },

    status: { type: String, enum: ['active', 'completed'], default: 'active', index: true },
    finalYield: { type: yieldSchema, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CropCycle', cropCycleSchema);
