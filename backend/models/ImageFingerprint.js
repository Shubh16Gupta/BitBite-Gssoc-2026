const mongoose = require('mongoose');

/**
 * ImageFingerprint.
 *
 * One record per accepted crop photo. Stores a cryptographic hash (exact-match
 * reuse detection) and a perceptual aHash (near-duplicate detection) so the
 * anti-fraud layer can reject photos that have already been submitted — by the
 * same farmer or by anyone else.
 */
const imageFingerprintSchema = new mongoose.Schema(
  {
    sha256: { type: String, required: true, index: true },
    aHash: { type: String, default: null },

    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true, index: true },
    field: { type: mongoose.Schema.Types.ObjectId, ref: 'Field' },
    cycle: { type: mongoose.Schema.Types.ObjectId, ref: 'CropCycle' },
    phaseNumber: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImageFingerprint', imageFingerprintSchema);
