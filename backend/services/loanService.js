/**
 * Loan service.
 *
 * Farmers apply to a specific approved bank; the application carries the
 * farmer's live AnnScore so the bank can underwrite against real crop data.
 * Banks only ever see applications addressed to them.
 */
const Loan = require('../models/Loan');
const Bank = require('../models/Bank');
const CropCycle = require('../models/CropCycle');
const ApiError = require('../utils/ApiError');

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
const round1 = (n) => (n == null ? null : Math.round(n * 10) / 10);

/** Banks a farmer can apply to (approved only, safe fields). */
const listApprovedBanks = () =>
  Bank.find({ status: 'Approved' })
    .select('institutionName branchName IFSC institutionType minAnnScore')
    .sort({ institutionName: 1 });

/** Snapshot the farmer's current crop-analysis figures. */
const riskSnapshot = async (farmerId) => {
  const cycles = await CropCycle.find({ farmer: farmerId }).select('phases finalYield').lean();
  const perCycleAnn = [];
  const perCycleHealth = [];
  let predictedYield = 0;

  cycles.forEach((c) => {
    const scored = (c.phases || []).filter((p) => typeof p.annScore === 'number');
    if (scored.length) {
      perCycleAnn.push(avg(scored.map((p) => p.annScore)));
      perCycleHealth.push(avg(scored.map((p) => p.cropHealthScore).filter((n) => typeof n === 'number')));
    }
    predictedYield += c.finalYield?.estimatedYield || 0;
  });

  return {
    annScoreAtApply: round1(avg(perCycleAnn)),
    cropHealthAtApply: round1(avg(perCycleHealth.filter((n) => n != null))),
    predictedYield: round1(predictedYield) || null,
  };
};

/** Create a loan application. */
const apply = async (farmerId, payload) => {
  const bank = await Bank.findById(payload.bankId);
  if (!bank) throw ApiError.notFound('Selected bank not found.');
  if (bank.status !== 'Approved') {
    throw ApiError.badRequest('That bank is not accepting applications yet.');
  }

  // Prevent stacking duplicate pending requests at the same bank.
  const pending = await Loan.findOne({ farmer: farmerId, bank: bank._id, status: 'pending' });
  if (pending) {
    throw ApiError.conflict('You already have a pending application with this bank.');
  }

  const snapshot = await riskSnapshot(farmerId);

  return Loan.create({
    farmer: farmerId,
    bank: bank._id,
    amount: payload.amount,
    cropType: payload.cropType,
    landArea: payload.landArea,
    purpose: payload.purpose,
    existingLoans: payload.existingLoans,
    ...snapshot,
    status: 'pending',
  });
};

/** A farmer's own applications. */
const listForFarmer = (farmerId) =>
  Loan.find({ farmer: farmerId })
    .populate('bank', 'institutionName branchName IFSC')
    .sort({ createdAt: -1 });

/** Applications addressed to one bank. */
const listForBank = (bankId, filter = {}) => {
  const query = { bank: bankId };
  if (filter.status) query.status = filter.status;
  return Loan.find(query)
    .populate('farmer', 'name phone state district village landArea landUnit primaryCrop')
    .sort({ createdAt: -1 });
};

/** Approve or reject an application (bank-scoped). */
const decide = async (bankId, loanId, decision, note) => {
  const loan = await Loan.findOne({ _id: loanId, bank: bankId });
  if (!loan) throw ApiError.notFound('Loan application not found.');
  if (loan.status !== 'pending') {
    throw ApiError.conflict(`This application is already ${loan.status}.`);
  }

  loan.status = decision;
  loan.decidedAt = new Date();
  loan.decisionNote = note || null;
  if (decision === 'approved') {
    loan.loanAccountNumber = `LN-${Date.now().toString(36).toUpperCase()}`;
  }
  await loan.save();
  return loan;
};

/** Loan portfolio summary for a bank dashboard. */
const getBankSummary = async (bankId) => {
  const [pending, approved, rejected] = await Promise.all([
    Loan.countDocuments({ bank: bankId, status: 'pending' }),
    Loan.countDocuments({ bank: bankId, status: 'approved' }),
    Loan.countDocuments({ bank: bankId, status: 'rejected' }),
  ]);
  const active = await Loan.find({ bank: bankId, status: 'approved' }).select('amount');
  return {
    pendingApplications: pending,
    approvedLoans: approved,
    rejectedApplications: rejected,
    totalDisbursed: active.reduce((s, l) => s + (l.amount || 0), 0),
  };
};

module.exports = {
  listApprovedBanks,
  apply,
  listForFarmer,
  listForBank,
  decide,
  getBankSummary,
  riskSnapshot,
};
