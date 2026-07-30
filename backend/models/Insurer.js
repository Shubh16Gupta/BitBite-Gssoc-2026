const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * Insurer model (crop-insurance provider).
 *
 * Mirrors the Bank onboarding flow: an insurer registers, stays `Pending` until
 * an admin approves it, and only then can authenticate. Insurers review farmer
 * insurance applications and — once approved — can see that farmer's crop
 * analysis reports.
 */
const INSURER_STATUS = ['Pending', 'Approved', 'Rejected'];

const insurerSchema = new mongoose.Schema(
  {
    insurerType: {
      type: String,
      enum: ['General Insurer', 'Agri Insurer', 'Government Scheme', 'Cooperative', 'Other'],
      required: [true, 'Insurer type is required'],
    },
    companyName: { type: String, required: true, trim: true },
    branchName: { type: String, required: true, trim: true },
    branchAddress: { type: String, required: true, trim: true },

    // IRDAI registration / licence number.
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      uppercase: true,
      trim: true,
    },

    officialEmail: {
      type: String,
      required: [true, 'Official email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    employeeId: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },

    password: { type: String, required: [true, 'Password is required'], select: false },

    status: { type: String, enum: INSURER_STATUS, default: 'Pending' },

    // Underwriting rule: minimum farmer AnnScore this insurer will cover.
    minAnnScore: { type: Number, min: 0, max: 100, default: null },
  },
  { timestamps: true }
);

insurerSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

insurerSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Insurer', insurerSchema);
module.exports.INSURER_STATUS = INSURER_STATUS;
