/**
 * Activity feed.
 *
 * Rather than maintaining a separate event log (which can drift from reality),
 * the feed is derived from the timestamps already stored on the farmer's own
 * records — fields, crop cycles, analyzed phases, insurance and loan
 * applications. It is therefore always accurate and needs no extra writes.
 */
const Field = require('../models/Field');
const CropCycle = require('../models/CropCycle');
const InsuranceApplication = require('../models/InsuranceApplication');
const Loan = require('../models/Loan');

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

/**
 * Build the farmer's most recent activity entries, newest first.
 * @param {string} farmerId
 * @param {number} [limit=10]
 * @returns {Promise<Array<{type,title,detail,at}>>}
 */
const getFarmerActivity = async (farmerId, limit = 10) => {
  const [fields, cycles, insurance, loans] = await Promise.all([
    Field.find({ farmer: farmerId }).select('fieldName cropType createdAt').lean(),
    CropCycle.find({ farmer: farmerId })
      .select('cropLabel createdAt phases status finalYield')
      .lean(),
    InsuranceApplication.find({ farmer: farmerId })
      .select('cropLabel sumInsured status createdAt decidedAt policyNumber')
      .lean(),
    Loan.find({ farmer: farmerId })
      .select('amount status createdAt decidedAt loanAccountNumber')
      .populate('bank', 'institutionName')
      .lean(),
  ]);

  const events = [];

  fields.forEach((f) => {
    events.push({
      type: 'field',
      title: `Field "${f.fieldName}" created`,
      detail: f.cropType ? `Crop: ${f.cropType}` : '',
      at: f.createdAt,
    });
  });

  cycles.forEach((c) => {
    events.push({
      type: 'cycle',
      title: `${c.cropLabel} crop cycle started`,
      detail: `${(c.phases || []).length}/4 phases analyzed`,
      at: c.createdAt,
    });

    // Each analyzed phase is its own event.
    (c.phases || []).forEach((p) => {
      events.push({
        type: 'phase',
        title: `Phase ${p.phaseNumber} analyzed — crop health ${p.cropHealthScore ?? '—'}%`,
        detail: `${c.cropLabel}${p.stageName ? ` · ${p.stageName}` : ''}`,
        at: p.createdAt || c.updatedAt,
      });
    });

    if (c.status === 'completed' && c.finalYield?.estimatedYield != null) {
      events.push({
        type: 'yield',
        title: `Final yield predicted — ${c.finalYield.estimatedYield} ${c.finalYield.unit || 'quintals'}`,
        detail: c.cropLabel,
        at: c.updatedAt,
      });
    }
  });

  insurance.forEach((a) => {
    events.push({
      type: 'insurance',
      title: `Insurance applied for ${a.cropLabel} — cover ${inr(a.sumInsured)}`,
      detail: '',
      at: a.createdAt,
    });
    if (a.decidedAt) {
      events.push({
        type: 'insurance',
        title: `Insurance ${a.status}${a.policyNumber ? ` — policy ${a.policyNumber}` : ''}`,
        detail: a.cropLabel,
        at: a.decidedAt,
      });
    }
  });

  loans.forEach((l) => {
    events.push({
      type: 'loan',
      title: `Loan application submitted for ${inr(l.amount)}`,
      detail: l.bank?.institutionName || '',
      at: l.createdAt,
    });
    if (l.decidedAt) {
      events.push({
        type: 'loan',
        title: `Loan ${l.status}${l.loanAccountNumber ? ` — ${l.loanAccountNumber}` : ''}`,
        detail: l.bank?.institutionName || '',
        at: l.decidedAt,
      });
    }
  });

  return events
    .filter((e) => e.at)
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, limit);
};

module.exports = { getFarmerActivity };
