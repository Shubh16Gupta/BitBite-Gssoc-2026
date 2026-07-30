/**
 * Insurance service.
 *
 * Quoting: sum insured = predicted yield × live mandi price. The premium rate is
 * risk-based, driven by the farmer's AnnScore — a well-monitored, healthy crop is
 * cheaper to insure. This reuses the same pipeline outputs the banks see, so the
 * platform's crop intelligence prices both credit and insurance.
 *
 * Visibility rule: an insurer may read a farmer's crop-analysis report only if
 * that insurer has an APPROVED application for them (enforced in getFarmerReport).
 */
const InsuranceApplication = require('../models/InsuranceApplication');
const Insurer = require('../models/Insurer');
const CropCycle = require('../models/CropCycle');
const ApiError = require('../utils/ApiError');
const marketService = require('./marketPriceService');
const bankService = require('./bankService');

const round2 = (n) => Math.round(n * 100) / 100;
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);

/** Premium rate (% of sum insured) by AnnScore band. */
const rateFor = (annScore) => {
  if (annScore == null) return { pct: 5.0, band: 'unrated' };
  if (annScore >= 85) return { pct: 2.0, band: 'low' };
  if (annScore >= 70) return { pct: 3.0, band: 'low' };
  if (annScore >= 50) return { pct: 4.5, band: 'moderate' };
  return { pct: 6.5, band: 'high' };
};

/** Average AnnScore across a cycle's analyzed phases. */
const cycleAnnScore = (cycle) =>
  avg((cycle.phases || []).filter((p) => typeof p.annScore === 'number').map((p) => p.annScore));

/**
 * Build a quote for a crop cycle (no persistence) — used both to preview and to
 * create an application.
 */
const quoteForCycle = async (cycle) => {
  const annScore = cycleAnnScore(cycle);

  // Best available yield estimate: final if harvested, else the latest phase's.
  const phases = [...(cycle.phases || [])].sort((a, b) => a.phaseNumber - b.phaseNumber);
  const latestYield =
    cycle.finalYield?.estimatedYield ??
    [...phases].reverse().find((p) => p.yield?.estimatedYield != null)?.yield?.estimatedYield ??
    null;

  const price = await marketService.getPrice(cycle.cropType);
  const pricePerQuintal = price?.modalPrice ?? null;

  // Fall back to the catalog baseline when no phase has been analyzed yet.
  const baselineYield = cycle.avgYieldPerAcre * (cycle.farmSize || 0);
  const yieldForCover = latestYield ?? round2(baselineYield);

  const sumInsured = pricePerQuintal ? Math.round(yieldForCover * pricePerQuintal) : 0;
  const { pct, band } = rateFor(annScore);
  const premium = Math.round((sumInsured * pct) / 100);

  return {
    annScoreAtApply: annScore == null ? null : round2(annScore),
    predictedYield: yieldForCover,
    marketPricePerQuintal: pricePerQuintal,
    sumInsured,
    premium,
    premiumRatePct: pct,
    riskBand: band,
    coverageNote:
      `Cover equals the crop's predicted value (${yieldForCover} ${cycle.yieldUnit || 'quintals'} × ` +
      `₹${pricePerQuintal ?? '—'}/quintal). Premium is ${pct}% of the sum insured, set by the ` +
      `farmer's AnnScore (${annScore == null ? 'not yet scored' : round2(annScore)}) — better crop ` +
      `health and consistent monitoring lower the rate.`,
  };
};

/** Preview a quote for a cycle the farmer owns. */
const getQuote = async (farmerId, cycleId) => {
  const cycle = await CropCycle.findOne({ _id: cycleId, farmer: farmerId });
  if (!cycle) throw ApiError.notFound('Crop cycle not found.');
  const quote = await quoteForCycle(cycle);
  return { cycle: { id: cycle._id, cropLabel: cycle.cropLabel, status: cycle.status }, ...quote };
};

/** Create an application for a crop cycle the farmer owns. */
const apply = async (farmerId, cycleId) => {
  const cycle = await CropCycle.findOne({ _id: cycleId, farmer: farmerId });
  if (!cycle) throw ApiError.notFound('Crop cycle not found.');

  const existing = await InsuranceApplication.findOne({ farmer: farmerId, cropCycle: cycleId });
  if (existing) {
    throw ApiError.conflict(`You already have a ${existing.status} application for this crop cycle.`);
  }

  const quote = await quoteForCycle(cycle);
  if (!quote.sumInsured) {
    throw ApiError.badRequest(
      'Cannot price cover for this crop right now (market price unavailable). Please try again later.'
    );
  }

  return InsuranceApplication.create({
    farmer: farmerId,
    field: cycle.field,
    cropCycle: cycle._id,
    cropLabel: cycle.cropLabel,
    farmSize: cycle.farmSize,
    farmSizeUnit: cycle.farmSizeUnit,
    ...quote,
    status: 'pending',
  });
};

/** A farmer's own applications, newest first. */
const listForFarmer = (farmerId) =>
  InsuranceApplication.find({ farmer: farmerId })
    .populate('field', 'fieldName')
    .populate('insurer', 'companyName branchName')
    .sort({ createdAt: -1 });

/**
 * Applications visible to an insurer: everything still pending (open market) plus
 * anything this insurer has already decided.
 */
const listForInsurer = (insurerId, filter = {}) => {
  const query = filter.status
    ? filter.status === 'pending'
      ? { status: 'pending' }
      : { status: filter.status, insurer: insurerId }
    : { $or: [{ status: 'pending' }, { insurer: insurerId }] };

  return InsuranceApplication.find(query)
    .populate('farmer', 'name phone state district village landArea landUnit primaryCrop')
    .populate('field', 'fieldName location area areaUnit')
    .sort({ createdAt: -1 });
};

/** Approve or reject an application. */
const decide = async (insurerId, applicationId, decision, note) => {
  const app = await InsuranceApplication.findById(applicationId);
  if (!app) throw ApiError.notFound('Application not found.');
  if (app.status !== 'pending') {
    throw ApiError.conflict(`This application is already ${app.status}.`);
  }

  app.status = decision;
  app.insurer = insurerId;
  app.decidedAt = new Date();
  app.decisionNote = note || null;
  if (decision === 'approved') {
    app.policyNumber = `POL-${Date.now().toString(36).toUpperCase()}`;
  }
  await app.save();
  return app;
};

/** Set an insurer's minimum-AnnScore underwriting rule. */
const setCriteria = (insurerId, minAnnScore) =>
  Insurer.findByIdAndUpdate(insurerId, { minAnnScore }, { new: true, runValidators: true });

/** Dashboard summary for an insurer. */
const getSummary = async (insurerId) => {
  const [pending, approved, rejected] = await Promise.all([
    InsuranceApplication.countDocuments({ status: 'pending' }),
    InsuranceApplication.countDocuments({ status: 'approved', insurer: insurerId }),
    InsuranceApplication.countDocuments({ status: 'rejected', insurer: insurerId }),
  ]);

  const active = await InsuranceApplication.find({ status: 'approved', insurer: insurerId }).select(
    'sumInsured premium annScoreAtApply'
  );

  return {
    pendingApplications: pending,
    approvedPolicies: approved,
    rejectedApplications: rejected,
    totalSumInsured: active.reduce((s, a) => s + (a.sumInsured || 0), 0),
    totalPremium: active.reduce((s, a) => s + (a.premium || 0), 0),
    averageAnnScore: (() => {
      const scores = active.map((a) => a.annScoreAtApply).filter((n) => typeof n === 'number');
      return scores.length ? Math.round(avg(scores) * 10) / 10 : null;
    })(),
  };
};

/**
 * A farmer's full crop-analysis report — only if this insurer holds an APPROVED
 * application for them. Reuses the same report builder the bank dashboard uses.
 */
const getFarmerReport = async (insurerId, farmerId) => {
  const approved = await InsuranceApplication.findOne({
    farmer: farmerId,
    insurer: insurerId,
    status: 'approved',
  });
  if (!approved) {
    throw ApiError.forbidden(
      'Crop reports are visible only after you approve this farmer\'s insurance application.'
    );
  }

  const report = await bankService.getFarmerReport(farmerId);
  if (!report) throw ApiError.notFound('Farmer not found.');
  return { ...report, policy: approved };
};

module.exports = {
  quoteForCycle,
  getQuote,
  apply,
  listForFarmer,
  listForInsurer,
  decide,
  setCriteria,
  getSummary,
  getFarmerReport,
  rateFor,
};
