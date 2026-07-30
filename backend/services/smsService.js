/**
 * SMS delivery service.
 *
 * OTP delivery is pluggable so the platform isn't tied to one gateway — pick a
 * provider with SMS_PROVIDER, or leave it on `auto` to use whichever set of
 * credentials is present:
 *
 *   fast2sms — Indian gateway, simplest to start with (single API key, its own
 *              DLT-approved OTP template, so no template paperwork of your own).
 *   msg91    — Indian gateway; needs an auth key + your own DLT template id.
 *   twilio   — global; for Indian destinations Twilio still requires a
 *              DLT-registered sender/template, so it is not the quickest start.
 *   mock     — logs the code to the server console (development only).
 *
 * Important: sending transactional SMS to Indian numbers is regulated (TRAI
 * DLT). Every provider above ultimately delivers through a DLT-registered
 * template — Fast2SMS/MSG91 supply one for OTP, which is why they are the
 * fastest path to real delivery.
 */
const axios = require('axios');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

let twilioClient = null;
if (env.twilio.accountSid && env.twilio.authToken) {
  // eslint-disable-next-line global-require
  const twilio = require('twilio');
  twilioClient = twilio(env.twilio.accountSid, env.twilio.authToken);
}

/**
 * Split a user-entered number into the two shapes gateways expect.
 *
 * The signup validator accepts both "9876543210" and "+919876543210", but
 * Twilio needs E.164 while the Indian gateways want a bare 10-digit number —
 * passing the wrong shape is silently rejected by the carrier.
 *
 * @param {string} phone
 * @returns {{ local: string, e164: string }}
 */
const normalizePhone = (phone) => {
  const digits = String(phone).replace(/\D/g, '');
  const local = digits.slice(-10);
  return { local, e164: `${env.sms.countryCode}${local}` };
};

/** Which provider to use, honouring SMS_PROVIDER and falling back to whatever is configured. */
const resolveProvider = () => {
  const explicit = env.sms.provider;
  if (explicit && explicit !== 'auto') return explicit;

  if (env.sms.fast2sms.apiKey) return 'fast2sms';
  if (env.sms.msg91.authKey && env.sms.msg91.templateId) return 'msg91';
  if (twilioClient && env.twilio.phoneNumber) return 'twilio';
  return 'mock';
};

// --- Providers. Each resolves to a short delivery descriptor or throws. ---

/**
 * Fast2SMS "otp" route — sends the gateway's own approved OTP template with our
 * code substituted in, so no DLT template of your own is needed to get started.
 */
const viaFast2Sms = async ({ local }, otp) => {
  const { data } = await axios.post(
    env.sms.fast2sms.baseUrl,
    { route: 'otp', variables_values: otp, numbers: local },
    {
      headers: { authorization: env.sms.fast2sms.apiKey },
      timeout: env.sms.timeoutMs,
    }
  );

  if (!data || data.return !== true) {
    throw new Error(data?.message || 'Fast2SMS rejected the request');
  }
  return { id: (data.request_id) || null };
};

/** MSG91 OTP endpoint — delivers our generated code through your DLT template. */
const viaMsg91 = async ({ local }, otp) => {
  const { data } = await axios.post(
    env.sms.msg91.baseUrl,
    {},
    {
      params: {
        template_id: env.sms.msg91.templateId,
        mobile: `${env.sms.countryCode.replace('+', '')}${local}`,
        otp,
        authkey: env.sms.msg91.authKey,
        ...(env.sms.msg91.senderId ? { sender: env.sms.msg91.senderId } : {}),
      },
      timeout: env.sms.timeoutMs,
    }
  );

  if (!data || data.type === 'error') {
    throw new Error(data?.message || 'MSG91 rejected the request');
  }
  return { id: data.request_id || null };
};

/** Twilio — global reach; needs E.164 and, for India, a registered sender. */
const viaTwilio = async ({ e164 }, otp, message) => {
  const res = await twilioClient.messages.create({
    body: message,
    from: env.twilio.phoneNumber,
    to: e164,
  });
  return { id: res.sid };
};

/**
 * Send an OTP to a phone number.
 *
 * @param {string} phone - as entered by the user (with or without +91)
 * @param {string} otp - the plaintext OTP to deliver
 * @returns {Promise<{ mock: boolean, provider: string, id?: string }>}
 */
const sendOtpSms = async (phone, otp) => {
  const message = `Your FarmTrust verification code is ${otp}. It expires in ${env.otpExpiryMinutes} minutes.`;
  const target = normalizePhone(phone);
  const provider = resolveProvider();

  if (provider === 'mock') {
    // Never silently "deliver" nothing in production — a farmer would sit
    // waiting for a code that was only ever written to a log file.
    if (env.nodeEnv === 'production') {
      throw new ApiError(
        503,
        'SMS delivery is not configured. Please try again later.'
      );
    }
    // eslint-disable-next-line no-console
    console.log(`📱 [MOCK SMS] to ${target.e164}: ${message}`);
    return { mock: true, provider: 'mock' };
  }

  try {
    let result;
    if (provider === 'fast2sms') result = await viaFast2Sms(target, otp);
    else if (provider === 'msg91') result = await viaMsg91(target, otp);
    else if (provider === 'twilio') result = await viaTwilio(target, otp, message);
    else throw new Error(`Unknown SMS provider "${provider}"`);

    return { mock: false, provider, id: result.id };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`💥 SMS send failed via ${provider}:`, err.message);
    throw new ApiError(502, 'Could not send the OTP right now. Please try again.');
  }
};

module.exports = { sendOtpSms, normalizePhone, resolveProvider };
