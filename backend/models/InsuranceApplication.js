const mongoose = require('mongoose');

/**
 * InsuranceApplication.
 *
 * A farmer's request to insure one crop cycle. The premium and sum insured are
 * derived at application time from the crop's predicted yield, the live mandi
 * price, and the farmer's AnnScore (healthier, better-monitored crops are lower
 * risk → cheaper premium).
 *
 * Once an insurer sets status to `approved`, that insurer is allowed to view the
 * farmer's full crop-analysis reports (see insuranceService.getFarmerReport).
 */
const APPLICATION_STATUS = ['pending', 'approved', 'rejected'];

const insuranceApplicationSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field', required: true },
    cropCycle: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle', required: true },

    // Snapshot of the crop/holding at application time.
    cropLabel: { type: String },
    farmSize: { type: Number },
    farmSizeUnit: { type: String },

    // Risk + pricing snapshot (so a later score change doesn't rewrite history).
    annScoreAtApply: { type: Number, min: 0, max: 100, default: null },
    predictedYield: { type: Number },
    marketPricePerQuintal: { type: Number },
    sumInsured: { type: Number, required: true },
    premium: { type: Number, required: true },
    premiumRatePct: { type: Number },
    riskBand: { type: String, enum: ['low', 'moderate', 'high', 'unrated'], default: 'unrated' },

    coverageNote: { type: String },

    status: { type: String, enum: APPLICATION_STATUS, default: 'pending', index: true },

    // Set when an insurer decides on the application.
    insurer: { type: mongoose.Schema.Types.ObjectId, ref: 'Insurer', default: null, index: true },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, default: null },
    policyNumber: { type: String, default: null },
  },
  { timestamps: true }
);

// A farmer can hold only one live application per crop cycle.
insuranceApplicationSchema.index({ farmer: 1, cropCycle: 1 }, { unique: true });

module.exports = mongoose.model('InsuranceApplication', insuranceApplicationSchema);
module.exports.APPLICATION_STATUS = APPLICATION_STATUS;
