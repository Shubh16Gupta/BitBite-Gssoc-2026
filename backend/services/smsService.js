/**
 * SMS delivery service.
 *
 * In production this uses Twilio. For now — since credentials may be absent —
 * it falls back to a "mock" mode that simply logs the OTP to the console,
 * which is enough for local development and testing.
 */
const env = require('../config/env');

let twilioClient = null;

// Lazily initialise a real Twilio client only if credentials are present.
if (env.twilio.accountSid && env.twilio.authToken) {
  // eslint-disable-next-line global-require
  const twilio = require('twilio');
  twilioClient = twilio(env.twilio.accountSid, env.twilio.authToken);
}

/**
 * Send an OTP to a phone number.
 *
 * @param {string} phone - destination phone number (E.164 recommended)
 * @param {string} otp - the plaintext OTP to deliver
 * @returns {Promise<{ mock: boolean }>}
 */
const sendOtpSms = async (phone, otp) => {
  const message = `Your FarmTrust verification code is ${otp}. It expires in ${env.otpExpiryMinutes} minutes.`;

  // Real delivery path.
  if (twilioClient && env.twilio.phoneNumber) {
    await twilioClient.messages.create({
      body: message,
      from: env.twilio.phoneNumber,
      to: phone,
    });
    return { mock: false };
  }

  // Mock path — log to console so developers can read the OTP locally.
  // eslint-disable-next-line no-console
  console.log(`📱 [MOCK SMS] to ${phone}: ${message}`);
  return { mock: true };
};

module.exports = { sendOtpSms };
