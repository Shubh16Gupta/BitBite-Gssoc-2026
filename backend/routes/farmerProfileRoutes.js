/**
 * Farmer profile routes: /api/farmer/profile/*
 *
 * Every route is guarded by `verifyFarmer` and operates on the authenticated
 * farmer only. Flow: auth -> validation chains -> validate -> controller.
 */
const express = require('express');

const router = express.Router();

const validate = require('../middleware/validate');
const uploadMemory = require('../middleware/uploadMemory');
const { verifyFarmer } = require('../middleware/authMiddleware');
const { updateProfileValidator } = require('../validators/farmerProfileValidator');
const {
  getProfileStatus,
  getProfile,
  updateProfile,
  uploadDocuments,
} = require('../controllers/farmerProfileController');

// All profile routes require an authenticated farmer.
router.use(verifyFarmer);

// Post-login completeness check (used to trigger the profile-completion redirect).
router.get('/status', getProfileStatus);

// Supporting documents (streamed to Cloudinary). Declared before '/' so the
// multipart parser only runs on this route.
router.put(
  '/documents',
  uploadMemory.fields([
    { name: 'aadhaarFrontImage', maxCount: 1 },
    { name: 'aadhaarBackImage', maxCount: 1 },
    { name: 'landDocument', maxCount: 1 },
  ]),
  uploadDocuments
);

router
  .route('/')
  .get(getProfile)
  .put(updateProfileValidator, validate, updateProfile);

module.exports = router;
