/**
 * OTP service — encapsulates all OTP lifecycle logic so controllers stay thin.
 * Responsibilities: generate, persist (hashed), deliver, and verify OTPs.
 */
const Otp = require('../models/Otp');
const generateOtp = require('../utils/generateOtp');
const { sendOtpSms } = require('./smsService');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

// Maximum verify attempts before an OTP is invalidated (anti brute-force).
const MAX_ATTEMPTS = 5;

/**
 * Create and dispatch a fresh OTP for a phone number.
 * Any previous OTPs for the same phone are removed so only one is ever live.
 *
 * In demo mode no SMS is sent and the plaintext code is handed back to the
 * caller so it can be shown/autofilled in the UI (see env.otpDemoMode).
 *
 * @param {string} phone
 * @returns {Promise<{ mock: boolean, demo: boolean, expiresAt: Date, code?: string }>}
 */
const createAndSendOtp = async (phone) => {
  // Invalidate previous codes for this number.
  await Otp.deleteMany({ phone });

  const code = generateOtp(6);
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

  // The pre-save hook hashes `otp` before it hits the database.
  await Otp.create({ phone, otp: code, expiresAt });

  // Demo mode: skip the gateway entirely and return the code to the caller.
  if (env.otpDemoMode) {
    return { mock: false, demo: true, expiresAt, code };
  }

  const { mock } = await sendOtpSms(phone, code);
  return { mock, demo: false, expiresAt };
};

/**
 * Verify a submitted OTP for a phone number.
 * Throws ApiError on any failure; resolves silently on success.
 *
 * @param {string} phone
 * @param {string} candidate - the OTP the user submitted
 */
const verifyOtp = async (phone, candidate) => {
  const record = await Otp.findOne({ phone }).sort({ createdAt: -1 });

  if (!record) {
    throw ApiError.badRequest('No OTP found. Please request a new one.');
  }

  // Expiry is enforced here too (TTL index may lag by up to a minute).
  if (record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteMany({ phone });
    throw ApiError.badRequest('OTP has expired. Please request a new one.');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await Otp.deleteMany({ phone });
    throw ApiError.badRequest('Too many invalid attempts. Please request a new OTP.');
  }

  const isMatch = await record.compareOtp(candidate);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    throw ApiError.badRequest('Invalid OTP.');
  }

  // Success — consume the OTP so it cannot be reused.
  await Otp.deleteMany({ phone });
};

module.exports = { createAndSendOtp, verifyOtp };
