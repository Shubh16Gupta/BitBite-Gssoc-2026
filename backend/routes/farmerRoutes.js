/**
 * Farmer routes: /api/farmer/*
 * Each route runs validation chains -> validate -> controller.
 */
const express = require('express');

const router = express.Router();

const uploadMemory = require('../middleware/uploadMemory');
const validate = require('../middleware/validate');
const { verifyFarmer } = require('../middleware/authMiddleware');
const {
  sendOtpValidator,
  verifyOtpValidator,
  signupValidator,
} = require('../validators/farmerValidator');
const { sendOtp, verifyOtpAndLogin, signup } = require('../controllers/farmerAuthController');
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');

// --- OTP ---
router.post('/send-otp', sendOtpValidator, validate, sendOtp);
router.post('/verify-otp', verifyOtpValidator, validate, verifyOtpAndLogin);

// --- Signup ---
// Accepts optional Aadhaar front/back image uploads alongside form fields. The
// images are held in memory and streamed to Cloudinary by the controller.
router.post(
  '/signup',
  uploadMemory.fields([
    { name: 'aadhaarFrontImage', maxCount: 1 },
    { name: 'aadhaarBackImage', maxCount: 1 },
  ]),
  signupValidator,
  validate,
  signup
);

// --- Example protected route (fetch own profile) ---
router.get(
  '/me',
  verifyFarmer,
  asyncHandler(async (req, res) => {
    return sendResponse(res, 200, 'Farmer profile fetched.', { farmer: req.farmer });
  })
);

module.exports = router;
