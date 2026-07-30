const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * Account approval states. Banks stay in `Pending` until an admin
 * approves them; they cannot authenticate before approval.
 */
const BANK_STATUS = ['Pending', 'Approved', 'Rejected'];

const bankSchema = new mongoose.Schema(
  {
    institutionType: {
      type: String,
      enum: ['Public Sector Bank', 'Private Bank', 'Cooperative Bank', 'RRB', 'NBFC', 'Other'],
      required: [true, 'Institution type is required'],
    },
    institutionName: { type: String, required: true, trim: true },
    branchName: { type: String, required: true, trim: true },
    branchAddress: { type: String, required: true, trim: true },

    IFSC: {
      type: String,
      required: [true, 'IFSC code is required'],
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

    // Hashed — never returned by default (select: false).
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },

    // Uploaded ID card path (relative to /uploads).
    employeeIdCard: {
      type: String,
      required: [true, 'Employee ID card is required'],
    },

    status: {
      type: String,
      enum: BANK_STATUS,
      default: 'Pending',
    },

    // Lending eligibility threshold: the minimum farmer AnnScore this bank will
    // consider. Set by the bank from its dashboard — not part of the auth flow.
    minAnnScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Hash the password before persisting, but only when it changed.
 * This keeps updates that don't touch the password cheap and avoids
 * double-hashing an already-hashed value.
 */
bankSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

/**
 * Instance method to compare a plaintext candidate against the stored hash.
 * The caller must have selected the password field explicitly.
 */
bankSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Bank', bankSchema);
module.exports.BANK_STATUS = BANK_STATUS;
