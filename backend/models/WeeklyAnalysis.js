const mongoose = require('mongoose');

/**
 * WeeklyAnalysis model.
 *
 * One record per field per week: a batch of crop images (stored on Cloudinary),
 * the weather captured at upload time, and the ANN score returned by the AI
 * service. The `{ field, weekNumber }` unique index enforces "one upload per
 * field per week" at the database level.
 */

// Weather is enrichment data; every attribute is optional so a failed weather
// fetch (marked `available: false`) never blocks saving an analysis.
const weatherSchema = new mongoose.Schema(
  {
    available: { type: Boolean, default: false },
    source: { type: String, default: 'open-meteo' },
    temperatureC: { type: Number },
    windSpeedKph: { type: Number },
    windDirectionDeg: { type: Number },
    weatherCode: { type: Number },
    description: { type: String },
    observedAt: { type: Date },
  },
  { _id: false }
);

const weeklyAnalysisSchema = new mongoose.Schema(
  {
    // Field this analysis belongs to.
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    // Denormalized owner reference so we can list/scope by farmer without a join.
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farmer',
      required: true,
      index: true,
    },

    weekNumber: {
      type: Number,
      required: [true, 'Week number is required'],
      min: [1, 'Week number must be at least 1'],
    },

    // Cloudinary secure URLs for the 3–5 uploaded crop images.
    imageUrls: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 3 && arr.length <= 5,
        message: 'Between 3 and 5 image URLs are required',
      },
    },

    weather: { type: weatherSchema, default: () => ({}) },

    // Final blended score: crop-health (vision) combined with weather favorability.
    annScore: {
      type: Number,
      required: [true, 'AnnScore is required'],
      min: 0,
      max: 100,
    },

    // Raw crop-health score from the vision model, before the weather blend.
    cropHealthScore: { type: Number, min: 0, max: 100 },

    // Weather favorability (0–100) used in the blend; null when weather is unavailable.
    weatherScore: { type: Number, min: 0, max: 100, default: null },

    // Provenance + per-image detail from the inference run.
    analysisMeta: {
      model: { type: String },
      sampleCount: { type: Number },
      weatherWeight: { type: Number },
      images: { type: [mongoose.Schema.Types.Mixed], default: undefined },
    },
  },
  {
    // Adds createdAt & updatedAt automatically (satisfies the "Created At" field).
    timestamps: true,
  }
);

// Enforce a single upload per field per week.
weeklyAnalysisSchema.index({ field: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyAnalysis', weeklyAnalysisSchema);
