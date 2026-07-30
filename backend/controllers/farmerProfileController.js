/**
 * Farmer profile controller.
 *
 * Powers the post-login "is the profile complete?" gate and profile editing.
 * All handlers run behind `verifyFarmer`, so `req.farmer` is always present.
 * This module never touches OTP/token logic — that stays in the auth layer.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const profileService = require('../services/farmerProfileService');
const cloudinaryService = require('../services/cloudinaryService');

/**
 * @route   GET /api/farmer/profile/status
 * @desc    Report whether the farmer's profile is complete. The client uses this
 *          right after login to decide whether to redirect to profile completion.
 * @access  Private (farmer)
 */
const getProfileStatus = asyncHandler(async (req, res) => {
  const { isProfileComplete, missingFields } = profileService.getProfileCompleteness(req.farmer);
  return sendResponse(res, 200, 'Profile status fetched successfully.', {
    isProfileComplete,
    missingFields,
  });
});

/**
 * @route   GET /api/farmer/profile
 * @desc    Fetch the authenticated farmer's full profile (safe fields only).
 * @access  Private (farmer)
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = profileService.toProfileView(req.farmer);
  const { isProfileComplete, missingFields } = profileService.getProfileCompleteness(req.farmer);
  return sendResponse(res, 200, 'Profile fetched successfully.', {
    profile,
    isProfileComplete,
    missingFields,
  });
});

/**
 * @route   PUT /api/farmer/profile
 * @desc    Update the authenticated farmer's profile (partial update).
 * @access  Private (farmer)
 */
const updateProfile = asyncHandler(async (req, res) => {
  const farmer = await profileService.updateProfile(req.farmer._id, req.body);
  if (!farmer) {
    // Should not happen (verifyFarmer already loaded the doc), but guard anyway.
    throw ApiError.notFound('Farmer account not found.');
  }

  const profile = profileService.toProfileView(farmer);
  const { isProfileComplete, missingFields } = profileService.getProfileCompleteness(farmer);
  return sendResponse(res, 200, 'Profile updated successfully.', {
    profile,
    isProfileComplete,
    missingFields,
  });
});

/**
 * @route   PUT /api/farmer/profile/documents
 * @desc    Upload/replace the farmer's supporting documents — Aadhaar front,
 *          Aadhaar back, and the land-ownership proof. Every document is
 *          optional so they can be added one at a time; files are stored on
 *          Cloudinary and only their URLs are persisted.
 * @access  Private (farmer)
 */
const uploadDocuments = asyncHandler(async (req, res) => {
  const files = req.files || {};
  const front = files.aadhaarFrontImage ? files.aadhaarFrontImage[0] : null;
  const back = files.aadhaarBackImage ? files.aadhaarBackImage[0] : null;
  const land = files.landDocument ? files.landDocument[0] : null;

  if (!front && !back && !land) {
    throw ApiError.badRequest('Attach at least one document to upload.');
  }

  const urls = await cloudinaryService.uploadDocuments({ front, back, land });
  const farmer = await profileService.updateDocuments(req.farmer._id, urls);
  if (!farmer) {
    throw ApiError.notFound('Farmer account not found.');
  }

  const profile = profileService.toProfileView(farmer);
  return sendResponse(res, 200, 'Documents uploaded successfully.', {
    profile,
    aadhaarDocuments: profile.aadhaarDocuments,
    aadhaarVerified: profile.aadhaarVerified,
    landDocument: profile.landDocument,
    landVerified: profile.landVerified,
    documentsComplete: profile.documentsComplete,
    missingDocuments: profile.missingDocuments,
  });
});

module.exports = { getProfileStatus, getProfile, updateProfile, uploadDocuments };
