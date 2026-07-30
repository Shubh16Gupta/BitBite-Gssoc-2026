/**
 * Local-disk image storage (development fallback).
 *
 * Used when Cloudinary is not configured, so the upload pipeline works with no
 * external account. Files are written to /uploads (already served statically by
 * app.js at `/uploads`) with a randomized, collision-proof filename, and
 * absolute URLs are returned so an external ML service can fetch them.
 *
 * Not intended for production — prefer Cloudinary there.
 */
const path = require('path');
const crypto = require('crypto');
const fs = require('fs/promises');
const fsSync = require('fs');
const env = require('../config/env');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists at boot.
if (!fsSync.existsSync(UPLOAD_DIR)) {
  fsSync.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const EXT_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const extensionFor = (file) => {
  const fromName = path.extname(file.originalname || '').toLowerCase();
  if (fromName) return fromName;
  return EXT_BY_MIME[file.mimetype] || '.img';
};

/**
 * Persist one in-memory file to disk and return its absolute URL.
 * @param {{ buffer: Buffer, originalname?: string, mimetype?: string }} file
 * @param {string} [prefix] - filename prefix, so different upload kinds stay
 *   distinguishable on disk (e.g. 'crop', 'aadhaar').
 * @returns {Promise<string>}
 */
const saveBuffer = async (file, prefix = 'crop') => {
  const unique = `${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
  const filename = `${prefix}-${unique}${extensionFor(file)}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
  return `${env.publicBaseUrl.replace(/\/$/, '')}/uploads/${filename}`;
};

/**
 * Persist many in-memory files, returning their URLs in input order.
 * @param {Array<object>} files
 * @param {string} [prefix]
 * @returns {Promise<string[]>}
 */
const saveImages = (files, prefix) => Promise.all(files.map((f) => saveBuffer(f, prefix)));

module.exports = { saveImages, saveBuffer, UPLOAD_DIR };
