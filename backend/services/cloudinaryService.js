/**
 * Cloudinary integration.
 *
 * Configures the SDK once from env and exposes a promise-based helper to upload
 * in-memory image buffers (from Multer's memoryStorage). Returns the secure
 * HTTPS URLs that get persisted on the WeeklyAnalysis document.
 */
const { v2: cloudinary } = require('cloudinary');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const localStorageService = require('./localStorageService');

// Configure the SDK if credentials are present. When they are missing we fail
// loudly at upload time rather than silently producing broken URLs.
if (env.cloudinary.configured) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

/**
 * Upload a single image buffer via Cloudinary's upload stream.
 * @param {Buffer} buffer
 * @param {string} folder
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          // Surface the real reason in the logs — the client message is
          // deliberately generic, but an operator needs to tell a bad API
          // secret from a rejected file or a network fault.
          // eslint-disable-next-line no-console
          console.error('💥 Cloudinary upload failed:', {
            folder,
            message: error.message,
            http_code: error.http_code || null,
          });
          return reject(ApiError.badRequest('Image upload failed. Please try again.'));
        }
        return resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });

/**
 * Upload many image buffers in parallel.
 * @param {Array<{ buffer: Buffer }>} files - Multer files (memoryStorage).
 * @param {string} [folder] - Cloudinary folder; defaults to the configured one.
 * @returns {Promise<string[]>} secure image URLs, in input order.
 */
const uploadImages = async (files, folder = env.cloudinary.uploadFolder, prefix) => {
  // Fallback: when Cloudinary isn't configured, store on local disk so the
  // pipeline still works in development (served at /uploads).
  if (!env.cloudinary.configured) {
    // eslint-disable-next-line no-console
    console.warn('⚠️  Cloudinary not configured — storing images locally under /uploads.');
    return localStorageService.saveImages(files, prefix);
  }

  const results = await Promise.all(files.map((file) => uploadBuffer(file.buffer, folder)));
  return results.map((r) => r.url);
};

/**
 * Upload identity documents (farmer Aadhaar front/back) to the documents folder.
 * Accepts a map of label -> Multer memory file and returns the same keys mapped
 * to their stored URLs; absent keys are simply omitted.
 *
 * @param {Object<string, {buffer: Buffer}>} filesByKey
 * @returns {Promise<Object<string, string>>}
 */
const uploadDocuments = async (filesByKey) => {
  const keys = Object.keys(filesByKey).filter((k) => filesByKey[k]);
  if (keys.length === 0) return {};

  const urls = await uploadImages(
    keys.map((k) => filesByKey[k]),
    env.cloudinary.documentsFolder,
    'aadhaar'
  );

  return keys.reduce((acc, key, i) => ({ ...acc, [key]: urls[i] }), {});
};

/**
 * Rewrite a Cloudinary URL to a bounded-size derivative for analysis.
 *
 * Phone photos are often 4000px+ and several MB each. The ML service downloads
 * every image and decodes it into a NumPy array, so a five-photo submission can
 * mean tens of MB of transfer and hundreds of MB of RAM — enough to time out or
 * exhaust a small instance. Cloudinary generates a capped copy on the fly, which
 * cuts both dramatically.
 *
 * The crop-health score is a colour-ratio index (VARI) averaged over patches, so
 * downscaling leaves it essentially unchanged.
 *
 * Non-Cloudinary URLs (the local-disk dev fallback) are returned untouched.
 *
 * @param {string} url
 * @returns {string}
 */
const toAnalysisUrl = (url) => {
  if (typeof url !== 'string' || !url.includes('/image/upload/')) return url;
  // c_limit only shrinks (never upscales); q_auto trims bytes without visibly
  // shifting colour.
  return url.replace('/image/upload/', `/image/upload/c_limit,w_${env.aiService.maxImageWidth},q_auto/`);
};

module.exports = { uploadImages, uploadBuffer, uploadDocuments, toAnalysisUrl };
