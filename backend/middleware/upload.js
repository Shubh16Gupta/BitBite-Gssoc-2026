/**
 * Multer configuration for document/image uploads.
 * Files are stored on disk under /uploads with a randomized, collision-proof
 * filename. Only image and PDF types are accepted, capped at 5 MB.
 */
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Ensure the uploads directory exists at boot.
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // e.g. employeeIdCard-3f9a1c...-1690000000000.png
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
    cb(null, `${file.fieldname}-${unique}${ext}`);
  },
});

// Whitelist safe document/image mime types.
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    return cb(null, true);
  }
  return cb(ApiError.badRequest('Only JPG, PNG, WEBP, or PDF files are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

module.exports = upload;
