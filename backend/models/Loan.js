const mongoose = require('mongoose');

/**
 * Loan application.
 *
 * A farmer applies to a specific (admin-approved) bank. The farmer's AnnScore at
 * application time is snapshotted so the bank sees the score that justified the
 * request, and so a later score change doesn't rewrite history.
 *
 * There is no tenure field: agri credit here is harvest-linked, so repayment is
 * expected after the crop cycle completes rather than on a monthly schedule.
 */
const LOAN_STATUS = ['pending', 'approved', 'rejected'];

const loanSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    bank: { type: mongoose.Schema.Types.ObjectId, ref: 'Bank', required: true, index: true },

    amount: { type: Number, required: [true, 'Loan amount is required'], min: 1 },
    cropType: { type: String, required: true, trim: true },
    landArea: { type: Number, min: 0 },
    purpose: { type: String, trim: true },
    existingLoans: { type: String, trim: true, default: '' },

    // Risk snapshot taken from the crop-analysis pipeline at apply time.
    annScoreAtApply: { type: Number, min: 0, max: 100, default: null },
    cropHealthAtApply: { type: Number, min: 0, max: 100, default: null },
    predictedYield: { type: Number, default: null },

    status: { type: String, enum: LOAN_STATUS, default: 'pending', index: true },
    decidedAt: { type: Date, default: null },
    decisionNote: { type: String, default: null },
    loanAccountNumber: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', loanSchema);
module.exports.LOAN_STATUS = LOAN_STATUS;
