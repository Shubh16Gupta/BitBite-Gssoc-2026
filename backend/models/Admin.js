const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');

/**
 * Admin model.
 *
 * Admins are platform operators who review and approve/reject bank
 * registrations. Passwords are bcrypt-hashed via a pre-save hook.
 */
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Hashed — never returned by default.
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
  },
  { timestamps: true }
);

/**
 * Hash the password before persisting, only when it changed.
 */
adminSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

/**
 * Compare a plaintext candidate against the stored hash.
 * Caller must have selected the password field explicitly.
 */
adminSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
