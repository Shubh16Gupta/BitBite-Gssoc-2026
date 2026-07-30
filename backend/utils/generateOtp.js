const crypto = require('crypto');

/**
 * Generates a cryptographically-random numeric OTP.
 * Uses crypto instead of Math.random for unpredictability.
 *
 * @param {number} length - number of digits (default 6)
 * @returns {string} zero-padded numeric OTP
 */
const generateOtp = (length = 6) => {
  const max = 10 ** length;
  const num = crypto.randomInt(0, max);
  return num.toString().padStart(length, '0');
};

module.exports = generateOtp;
