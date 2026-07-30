/**
 * Farmer profile service.
 *
 * Owns the "is this farmer's profile complete?" rule and profile updates.
 * Kept separate from the auth flow: it never mints tokens or verifies OTPs — it
 * only reads/writes profile attributes on an already-authenticated Farmer.
 */
const Farmer = require('../models/Farmer');
const env = require('../config/env');

/**
 * The attributes that together constitute a "complete" farmer profile.
 * Full name and phone come from auth; the rest describe the farmer's holding.
 */
const REQUIRED_PROFILE_FIELDS = [
  'name',
  'phone',
  'landArea',
  'state',
  'district',
  'village',
];

/**
 * True when a value is present and meaningful (non-empty string / real number).
 */
const isPresent = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  return true;
};

/**
 * Compute profile completeness for a farmer document.
 * @param {Farmer} farmer
 * @returns {{ isProfileComplete: boolean, missingFields: string[] }}
 */
const getProfileCompleteness = (farmer) => {
  const missingFields = REQUIRED_PROFILE_FIELDS.filter((key) => !isPresent(farmer[key]));
  return {
    isProfileComplete: missingFields.length === 0,
    missingFields,
  };
};

/**
 * Resolve a stored document reference to a URL the client can render.
 *
 * Documents uploaded through Cloudinary are already absolute HTTPS URLs. Records
 * created before that change hold a bare filename from the old disk-based
 * uploader, so those are resolved against the public /uploads mount.
 */
const toDocumentUrl = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${env.publicBaseUrl.replace(/\/$/, '')}/uploads/${value}`;
};

/**
 * The supporting documents a complete farmer file needs, in the order the UI
 * should nudge for them.
 */
const REQUIRED_DOCUMENTS = [
  { key: 'aadhaarFront', field: 'aadhaarFrontImage', label: 'Aadhaar front' },
  { key: 'aadhaarBack', field: 'aadhaarBackImage', label: 'Aadhaar back' },
  { key: 'landDocument', field: 'landDocument', label: 'Land ownership document' },
];

/**
 * Which supporting documents are still missing.
 *
 * Kept separate from `getProfileCompleteness` on purpose: that flag gates the
 * post-login "finish your profile" redirect, and folding documents into it
 * would bounce every existing farmer back to the form. This is an advisory
 * signal the UI surfaces as a warning instead.
 *
 * @param {Farmer} farmer
 * @returns {{ documentsComplete: boolean, missingDocuments: string[] }}
 */
const getDocumentStatus = (farmer) => {
  const missing = REQUIRED_DOCUMENTS.filter((d) => !farmer[d.field]);
  return {
    documentsComplete: missing.length === 0,
    missingDocuments: missing.map((d) => d.label),
  };
};

/**
 * Shape a farmer document into a safe, client-facing profile object.
 * Sensitive/auth-only fields (aadhaarHash, etc.) are never included — the
 * Aadhaar number itself is exposed only in its masked form.
 */
const toProfileView = (farmer) => ({
  id: farmer._id,
  name: farmer.name,
  phone: farmer.phone,
  dateOfBirth: farmer.dateOfBirth,
  gender: farmer.gender,
  aadhaarMasked: farmer.aadhaarMasked,
  aadhaarDocuments: {
    front: toDocumentUrl(farmer.aadhaarFrontImage),
    back: toDocumentUrl(farmer.aadhaarBackImage),
  },
  // "Verified" here means both sides of the Aadhaar card are on file. It is a
  // document-completeness signal, not a check against the UIDAI registry.
  aadhaarVerified: Boolean(farmer.aadhaarFrontImage && farmer.aadhaarBackImage),
  landDocument: toDocumentUrl(farmer.landDocument),
  // Land area is self-declared until a supporting document is uploaded.
  landVerified: Boolean(farmer.landDocument),
  ...getDocumentStatus(farmer),
  landArea: farmer.landArea,
  landUnit: farmer.landUnit,
  ownershipType: farmer.ownershipType,
  state: farmer.state,
  district: farmer.district,
  village: farmer.village,
  primaryCrop: farmer.primaryCrop,
  irrigationType: farmer.irrigationType,
  createdAt: farmer.createdAt,
  updatedAt: farmer.updatedAt,
});

/**
 * Apply a partial profile update to a farmer and persist it.
 * Only whitelisted, non-auth attributes may be changed here — phone (the login
 * identity) and Aadhaar are intentionally excluded.
 * @param {string} farmerId
 * @param {object} data
 * @returns {Promise<Farmer|null>} updated farmer, or null if not found.
 */
const updateProfile = (farmerId, data) => {
  const update = {};
  if (data.name !== undefined) update.name = data.name;
  if (data.landArea !== undefined) update.landArea = data.landArea;
  if (data.landUnit !== undefined) update.landUnit = data.landUnit;
  if (data.ownershipType !== undefined) update.ownershipType = data.ownershipType;
  if (data.state !== undefined) update.state = data.state;
  if (data.district !== undefined) update.district = data.district;
  if (data.village !== undefined) update.village = data.village;

  return Farmer.findByIdAndUpdate(farmerId, update, {
    new: true,
    runValidators: true,
  });
};

/**
 * Store document URLs on the farmer. Only the documents actually supplied are
 * written, so uploading a replacement front never clears an existing back.
 * @param {string} farmerId
 * @param {{ front?: string, back?: string, land?: string }} urls
 * @returns {Promise<Farmer|null>}
 */
const updateDocuments = (farmerId, urls) => {
  const update = {};
  if (urls.front) update.aadhaarFrontImage = urls.front;
  if (urls.back) update.aadhaarBackImage = urls.back;
  if (urls.land) update.landDocument = urls.land;

  return Farmer.findByIdAndUpdate(farmerId, update, { new: true, runValidators: true });
};

module.exports = {
  REQUIRED_PROFILE_FIELDS,
  REQUIRED_DOCUMENTS,
  getProfileCompleteness,
  getDocumentStatus,
  toProfileView,
  toDocumentUrl,
  updateProfile,
  updateDocuments,
};
