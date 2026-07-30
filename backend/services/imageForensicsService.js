/**
 * Image forensics (anti-fraud).
 *
 * Verifies uploaded crop photos before they can influence a lending score:
 *   • EXIF GPS must (when present) fall within a radius of the field's location.
 *   • EXIF timestamp must (when present) be after sowing and not in the future.
 *   • Images must be distinct within a submission and not reused across records
 *     (exact match via SHA-256, near-duplicate via perceptual aHash).
 *
 * Missing EXIF isn't a rejection (many pipelines strip it) — it lowers the
 * submission's confidence instead. Concrete mismatches and reuse are hard fails.
 */
const crypto = require('crypto');
const exifr = require('exifr');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const ImageFingerprint = require('../models/ImageFingerprint');

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

/** Extract GPS + capture time from an image buffer (best-effort, never throws). */
const extractExif = async (buffer) => {
  let latitude = null;
  let longitude = null;
  let takenAt = null;
  try {
    const gps = await exifr.gps(buffer);
    if (gps && Number.isFinite(gps.latitude) && Number.isFinite(gps.longitude)) {
      latitude = gps.latitude;
      longitude = gps.longitude;
    }
  } catch {
    /* no GPS */
  }
  try {
    const meta = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
    const raw = meta && (meta.DateTimeOriginal || meta.CreateDate || meta.ModifyDate);
    if (raw) {
      const d = new Date(raw);
      if (!Number.isNaN(d.getTime())) takenAt = d;
    }
  } catch {
    /* no timestamp */
  }
  return { latitude, longitude, takenAt };
};

const haversineKm = (aLat, aLon, bLat, bLon) => {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

/** Hamming distance between two equal-length hex hash strings. */
const hammingHex = (h1, h2) => {
  if (!h1 || !h2 || h1.length !== h2.length) return 64;
  let dist = 0;
  for (let i = 0; i < h1.length; i += 1) {
    let x = parseInt(h1[i], 16) ^ parseInt(h2[i], 16);
    while (x) {
      dist += x & 1;
      x >>= 1;
    }
  }
  return dist;
};

/**
 * Pre-upload screening on the raw photo buffers. Throws ApiError on hard fails
 * (location mismatch, invalid time, exact reuse, duplicates within submission).
 * @returns {Promise<{ shas: string[], exifs: object[], withGps: number, withTime: number }>}
 */
const prescreen = async ({ files, field, cycle, farmerId }) => {
  const shas = files.map((f) => sha256(f.buffer));

  // Distinct within this submission.
  if (new Set(shas).size !== shas.length) {
    throw ApiError.badRequest('Please upload distinct photos — duplicate images were detected.');
  }

  // Not reused in any previous submission (same or other farmer).
  const existing = await ImageFingerprint.findOne({ sha256: { $in: shas } }).select('farmer');
  if (existing) {
    const who = String(existing.farmer) === String(farmerId) ? 'in an earlier phase' : 'by another farmer';
    throw ApiError.badRequest(`One or more photos have already been submitted ${who}. Please take fresh photos.`);
  }

  const exifs = await Promise.all(files.map((f) => extractExif(f.buffer)));

  let withGps = 0;
  let withTime = 0;
  const now = Date.now();
  const sowing = new Date(cycle.sowingDate).getTime();
  const skewMs = env.forensics.timeSkewHours * 3600 * 1000;

  for (const ex of exifs) {
    if (ex.latitude != null) {
      withGps += 1;
      const km = haversineKm(field.location.latitude, field.location.longitude, ex.latitude, ex.longitude);
      if (km > env.forensics.gpsRadiusKm) {
        throw ApiError.badRequest(
          `A photo was taken ${km.toFixed(1)} km from the field (limit ${env.forensics.gpsRadiusKm} km). Take photos at the field.`
        );
      }
    }
    if (ex.takenAt) {
      withTime += 1;
      const t = ex.takenAt.getTime();
      if (t > now + skewMs) {
        throw ApiError.badRequest('A photo has a future capture date. Please use genuine photos.');
      }
      if (t < sowing - skewMs) {
        throw ApiError.badRequest('A photo predates the crop sowing date. Please use current-season photos.');
      }
    }
  }

  return { shas, exifs, withGps, withTime };
};

/**
 * Near-duplicate check against OTHER farmers' photos, using perceptual aHash.
 * (Same-farmer near-duplicates are expected — they photograph the same field.)
 * Throws on a match. No-op when aHashes are unavailable (ML mock mode).
 */
const checkNearDuplicates = async ({ farmerId, images }) => {
  const hashes = (images || []).map((im) => im && im.aHash).filter(Boolean);
  if (hashes.length === 0) return;

  const others = await ImageFingerprint.find({ farmer: { $ne: farmerId }, aHash: { $ne: null } })
    .select('aHash')
    .sort({ createdAt: -1 })
    .limit(1000)
    .lean();

  for (const h of hashes) {
    for (const rec of others) {
      if (hammingHex(h, rec.aHash) <= env.forensics.nearDuplicateThreshold) {
        throw ApiError.badRequest(
          'A photo closely matches another farmer\'s submission. Please upload your own field photos.'
        );
      }
    }
  }
};

/** Build the per-phase verification + confidence summary. */
const buildVerification = ({ withGps, withTime, imageCount, mocked }) => {
  const flags = [];
  let confidence = 100;

  const locationVerified = withGps > 0;
  const timeVerified = withTime > 0;

  if (!locationVerified) {
    confidence -= 25;
    flags.push('Photo GPS metadata missing — field location not verified.');
  }
  if (!timeVerified) {
    confidence -= 15;
    flags.push('Photo timestamps missing — capture time not verified.');
  }
  if (mocked) {
    confidence -= 40;
    flags.push('AI model unavailable — crop-health score is a placeholder, not a real measurement.');
  }

  confidence = Math.max(0, Math.min(100, confidence));
  const level = confidence >= 75 ? 'high' : confidence >= 50 ? 'medium' : 'low';

  return {
    confidence,
    level,
    locationVerified,
    timeVerified,
    imagesUnique: true, // enforced upstream (else rejected)
    imagesWithGps: withGps,
    imagesWithTime: withTime,
    imageCount,
    flags,
  };
};

/** Persist fingerprints for accepted images (call after the phase is saved). */
const saveFingerprints = async ({ shas, images, farmerId, fieldId, cycleId, phaseNumber }) => {
  const docs = shas.map((sha, i) => ({
    sha256: sha,
    aHash: (images && images[i] && images[i].aHash) || null,
    farmer: farmerId,
    field: fieldId,
    cycle: cycleId,
    phaseNumber,
  }));
  await ImageFingerprint.insertMany(docs, { ordered: false }).catch(() => {});
};

module.exports = {
  sha256,
  extractExif,
  haversineKm,
  hammingHex,
  prescreen,
  checkNearDuplicates,
  buildVerification,
  saveFingerprints,
};
