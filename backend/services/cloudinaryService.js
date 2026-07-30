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

module.exports = { uploadImages, uploadBuffer, uploadDocuments };
