/**
 * Farmer authentication controller.
 * Handles OTP send/verify and signup. Business logic that is reusable
 * (OTP lifecycle, token signing) lives in services — controllers orchestrate.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Farmer = require('../models/Farmer');
const { createAndSendOtp, verifyOtp } = require('../services/otpService');
const { signToken } = require('../services/tokenService');
const cloudinaryService = require('../services/cloudinaryService');
const env = require('../config/env');

/**
 * Build the JWT payload + safe farmer object returned to clients.
 */
const buildFarmerAuthPayload = (farmer) => {
  const token = signToken({ id: farmer._id, role: 'farmer' });
  return {
    token,
    farmer: {
      id: farmer._id,
      name: farmer.name,
      phone: farmer.phone,
      state: farmer.state,
      district: farmer.district,
      village: farmer.village,
      primaryCrop: farmer.primaryCrop,
    },
  };
};

/**
 * @route   POST /api/farmer/send-otp
 * @desc    Generate & send a mock 6-digit OTP to the phone number.
 * @access  Public
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const { mock, expiresAt } = await createAndSendOtp(phone);

  // In non-production mock mode we surface a hint so testers know where to look.
  const message = mock
    ? 'OTP generated (mock mode — check server console).'
    : 'OTP sent successfully.';

  return sendResponse(res, 200, message, {
    phone,
    expiresAt,
    // Only expose the dev hint outside production.
    ...(env.nodeEnv !== 'production' ? { note: 'Mock OTP is logged to the server console.' } : {}),
  });
});

/**
 * @route   POST /api/farmer/verify-otp
 * @desc    Verify OTP. If a farmer with this phone exists, return a login token;
 *          otherwise signal that signup is required.
 * @access  Public
 */
const verifyOtpAndLogin = asyncHandler(async (req, res) => {
  const { phone, otp } = req.body;

  // Throws ApiError on any failure.
  await verifyOtp(phone, otp);

  const farmer = await Farmer.findOne({ phone });

  // New user — verified but not registered yet.
  if (!farmer) {
    return sendResponse(res, 200, 'OTP verified. Please complete signup.', {
      phone,
      isRegistered: false,
    });
  }

  // Existing user — issue a token.
  return sendResponse(res, 200, 'OTP verified. Login successful.', {
    isRegistered: true,
    ...buildFarmerAuthPayload(farmer),
  });
});

/**
 * @route   POST /api/farmer/signup
 * @desc    Register a new farmer and issue a JWT.
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    aadhaarNumber,
    dateOfBirth,
    gender,
    state,
    district,
    village,
    landArea,
    landUnit,
    ownershipType,
    primaryCrop,
    irrigationType,
  } = req.body;

  // Guard: duplicate phone.
  const existingPhone = await Farmer.findOne({ phone });
  if (existingPhone) {
    throw ApiError.conflict('A farmer with this phone number already exists.');
  }

  // Guard: duplicate Aadhaar (compared via one-way hash, never plaintext).
  const aadhaarHash = Farmer.hashAadhaar(aadhaarNumber);
  const existingAadhaar = await Farmer.findOne({ aadhaarHash });
  if (existingAadhaar) {
    throw ApiError.conflict('A farmer with this Aadhaar number already exists.');
  }

  // Multer (uploadMemory.fields) attaches files under req.files.<field>[0].
  // Uploading happens only after the duplicate checks above, so a rejected
  // signup never leaves an orphaned image in Cloudinary.
  const files = req.files || {};
  const { front, back } = await cloudinaryService.uploadDocuments({
    front: files.aadhaarFrontImage ? files.aadhaarFrontImage[0] : null,
    back: files.aadhaarBackImage ? files.aadhaarBackImage[0] : null,
  });
  const aadhaarFrontImage = front || null;
  const aadhaarBackImage = back || null;

  const farmer = new Farmer({
    name,
    phone,
    dateOfBirth,
    gender,
    state,
    district,
    village,
    landArea,
    landUnit,
    ownershipType,
    primaryCrop,
    irrigationType,
    aadhaarFrontImage,
    aadhaarBackImage,
  });

  // Hash + mask Aadhaar via the model helper.
  farmer.setAadhaar(aadhaarNumber);

  await farmer.save();

  return sendResponse(res, 201, 'Farmer registered successfully.', buildFarmerAuthPayload(farmer));
});

module.exports = { sendOtp, verifyOtpAndLogin, signup };
