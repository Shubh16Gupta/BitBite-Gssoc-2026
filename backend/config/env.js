/**
 * Centralized, validated access to environment variables.
 * Loading `dotenv` here (before anything else imports this module) guarantees
 * that process.env is populated no matter which file is required first.
 */
const dotenv = require('dotenv');
dotenv.config();

// Fail fast if a critical secret is missing — prevents insecure boot.
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const PORT = parseInt(process.env.PORT, 10) || 5000;

const env = {
  port: PORT,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Absolute base URL of this backend, used to build public URLs for locally
  // stored uploads (so an external ML service can fetch them).
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`,

  mongoUri: process.env.MONGO_URI,

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 5,

  corsOrigin: process.env.CORS_ORIGIN || '*',

  rateLimitWindowMinutes: parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,

  // Cloudinary — used by the Weekly Crop Analysis module to store crop images.
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    // Folder under which weekly crop images are organized.
    uploadFolder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'farmtrust/weekly-analysis',
    // Folder for identity documents (farmer Aadhaar front/back). Kept separate
    // from crop imagery so access rules can differ per folder.
    documentsFolder: process.env.CLOUDINARY_DOCUMENTS_FOLDER || 'farmtrust/farmer-documents',
    // True only when all three credentials are present.
    get configured() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret);
    },
  },

  // Weather provider. Defaults to Open-Meteo, which is free and needs no API key.
  // `archiveUrl` is the historical (reanalysis) endpoint used for rainfall — it
  // has a separate quota from the live forecast endpoint.
  weather: {
    baseUrl: process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast',
    archiveUrl: process.env.WEATHER_ARCHIVE_URL || 'https://archive-api.open-meteo.com/v1/archive',
    timeoutMs: parseInt(process.env.WEATHER_API_TIMEOUT_MS, 10) || 8000,
  },

  // Rainfall history (Open-Meteo past-days precipitation) used by the crop-cycle
  // pipeline. Reuses the weather base URL + timeout above.
  rainfall: {
    lookbackDays: parseInt(process.env.RAINFALL_LOOKBACK_DAYS, 10) || 30,
  },

  // Crop-health ML service (see /ml-service). When AI_SERVICE_URL is set, the
  // backend POSTs image URLs to `${url}/analyze` and reads back cropHealthScore;
  // otherwise a mocked score is used so the pipeline still works in dev.
  aiService: {
    url: process.env.AI_SERVICE_URL || '',
    timeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 20000,
    mockScore: parseInt(process.env.AI_SERVICE_MOCK_SCORE, 10) || 87,
    // Random patches sampled per image by the ML service.
    sampleCount: parseInt(process.env.AI_SAMPLE_COUNT, 10) || 10,
  },

  // Market prices via data.gov.in (Agmarknet mandi feed). The default api-key is
  // data.gov.in's public sample key; register for your own for higher limits.
  market: {
    baseUrl:
      process.env.MARKET_API_URL ||
      'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
    apiKey: process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b',
    timeoutMs: parseInt(process.env.MARKET_API_TIMEOUT_MS, 10) || 8000,
  },

  // Anti-fraud image forensics.
  forensics: {
    // Max distance (km) between a photo's EXIF GPS and the field before rejection.
    gpsRadiusKm: parseFloat(process.env.PHOTO_GPS_RADIUS_KM) || 5,
    // Perceptual-hash Hamming distance under which two photos count as duplicates.
    nearDuplicateThreshold: parseInt(process.env.PHOTO_AHASH_THRESHOLD, 10) || 6,
    // Clock-skew tolerance (hours) for EXIF timestamp checks.
    timeSkewHours: parseInt(process.env.PHOTO_TIME_SKEW_HOURS, 10) || 24,
  },

  // Final AnnScore = (1 - weatherWeight) * cropHealthScore + weatherWeight * weatherScore.
  score: {
    weatherWeight: (() => {
      const w = parseFloat(process.env.SCORE_WEATHER_WEIGHT);
      return Number.isFinite(w) && w >= 0 && w <= 1 ? w : 0.2;
    })(),
  },

  // Seed credentials for the initial admin account (used by `npm run seed:admin`).
  seedAdmin: {
    name: process.env.SEED_ADMIN_NAME || 'FarmTrust Admin',
    email: process.env.SEED_ADMIN_EMAIL || '',
    password: process.env.SEED_ADMIN_PASSWORD || '',
  },
};

module.exports = env;
