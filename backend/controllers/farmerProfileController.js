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
 * @desc    Upload/replace the farmer's Aadhaar card photos. Each side is
 *          optional, so the front and back can be added independently; images
 *          are stored on Cloudinary and only their URLs are persisted.
 * @access  Private (farmer)
 */
const uploadAadhaarDocuments = asyncHandler(async (req, res) => {
  const files = req.files || {};
  const front = files.aadhaarFrontImage ? files.aadhaarFrontImage[0] : null;
  const back = files.aadhaarBackImage ? files.aadhaarBackImage[0] : null;

  if (!front && !back) {
    throw ApiError.badRequest('Attach an Aadhaar front and/or back image to upload.');
  }

  const urls = await cloudinaryService.uploadDocuments({ front, back });
  const farmer = await profileService.updateAadhaarDocuments(req.farmer._id, urls);
  if (!farmer) {
    throw ApiError.notFound('Farmer account not found.');
  }

  const profile = profileService.toProfileView(farmer);
  return sendResponse(res, 200, 'Aadhaar documents uploaded successfully.', {
    profile,
    aadhaarDocuments: profile.aadhaarDocuments,
    aadhaarVerified: profile.aadhaarVerified,
  });
});

module.exports = { getProfileStatus, getProfile, updateProfile, uploadAadhaarDocuments };
