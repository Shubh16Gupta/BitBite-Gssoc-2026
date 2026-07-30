const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * Farmer model.
 *
 * Note on Aadhaar: we never store the raw 12-digit Aadhaar number in plaintext.
 * It is a sensitive government identifier, so we keep a one-way SHA-256 hash
 * (used only for duplicate detection) plus a masked display value
 * (e.g. "XXXX-XXXX-1234"). The virtual setter `aadhaarNumber` derives both.
 */
const farmerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },

    // Hashed Aadhaar — never exposed, used for uniqueness checks.
    aadhaarHash: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    // Safe-to-display masked Aadhaar, e.g. "XXXXXXXX1234".
    aadhaarMasked: {
      type: String,
      required: true,
    },

    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },

    // Location
    state: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },

    // Land details
    landArea: { type: Number, required: true, min: 0 },
    landUnit: {
      type: String,
      enum: ['acre', 'hectare', 'bigha', 'guntha'],
      default: 'acre',
    },
    ownershipType: {
      type: String,
      enum: ['owned', 'leased', 'shared'],
      default: 'owned',
    },

    // Farming details
    primaryCrop: { type: String, required: true, trim: true },
    irrigationType: {
      type: String,
      enum: ['rainfed', 'canal', 'borewell', 'drip', 'sprinkler', 'other'],
      default: 'rainfed',
    },

    // Uploaded document paths (relative to /uploads)
    aadhaarFrontImage: { type: String, default: null },
    aadhaarBackImage: { type: String, default: null },
  },
  {
    // Adds createdAt & updatedAt automatically.
    timestamps: true,
  }
);

/**
 * Convenience setter: assign a raw Aadhaar number and the schema will
 * automatically populate `aadhaarHash` and `aadhaarMasked`.
 * Call `farmer.setAadhaar('123412341234')` before saving.
 */
farmerSchema.methods.setAadhaar = function setAadhaar(rawAadhaar) {
  const digitsOnly = String(rawAadhaar).replace(/\D/g, '');
  this.aadhaarHash = crypto.createHash('sha256').update(digitsOnly).digest('hex');
  this.aadhaarMasked = `XXXXXXXX${digitsOnly.slice(-4)}`;
};

/**
 * Static helper to compute the Aadhaar hash for duplicate lookups
 * without instantiating a document.
 */
farmerSchema.statics.hashAadhaar = function hashAadhaar(rawAadhaar) {
  const digitsOnly = String(rawAadhaar).replace(/\D/g, '');
  return crypto.createHash('sha256').update(digitsOnly).digest('hex');
};

module.exports = mongoose.model('Farmer', farmerSchema);
