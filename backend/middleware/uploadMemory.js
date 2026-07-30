/**
 * In-memory Multer configuration for images that are streamed straight to
 * Cloudinary (Weekly Crop Analysis). Unlike middleware/upload.js — which writes
 * Aadhaar documents to disk — this keeps each file as a Buffer in memory so it
 * can be piped to Cloudinary's upload stream without ever hitting local disk.
 */
const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Only real image types — no PDFs here.
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(ApiError.badRequest('Only JPG, PNG, or WEBP images are allowed.'), false);
};

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per image
});

module.exports = uploadMemory;
