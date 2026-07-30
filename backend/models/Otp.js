const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * OTP model.
 *
 * The OTP itself is stored hashed (bcrypt) so a database leak does not
 * expose live one-time codes. A TTL index on `expiresAt` lets MongoDB
 * automatically purge expired documents.
 */
const otpSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    // bcrypt hash of the numeric OTP.
    otp: {
      type: String,
      required: true,
    },
    // Number of verify attempts — used to lock out brute-force attempts.
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL index: MongoDB removes the document once `expiresAt` passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Hash the OTP before saving so raw codes never touch the database.
 */
otpSchema.pre('save', async function hashOtp(next) {
  if (!this.isModified('otp')) return next();
  const salt = await bcrypt.genSalt(10);
  this.otp = await bcrypt.hash(this.otp, salt);
  return next();
});

/**
 * Compare a candidate OTP against the stored hash.
 */
otpSchema.methods.compareOtp = function compareOtp(candidate) {
  return bcrypt.compare(String(candidate), this.otp);
};

module.exports = mongoose.model('Otp', otpSchema);
