/**
 * Crop-health inference client.
 *
 * Delegates image analysis to the Python ML service (see /ml-service). It POSTs
 * the uploaded image URLs to `${AI_SERVICE_URL}/analyze`; the service samples
 * random patches per image, scores each for crop health, and returns an averaged
 * `cropHealthScore` (0–100) plus per-image detail.
 *
 * This module is vision-only. Blending the crop-health score with weather into
 * the final AnnScore happens in scoreService.js, where weather already lives.
 *
 * When `AI_SERVICE_URL` is not configured, a mocked score is returned so the
 * upload pipeline still works end-to-end in development.
 */
const axios = require('axios');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * Analyze a week's crop images and return the field crop-health score.
 * @param {object} args
 * @param {string[]} args.imageUrls - publicly fetchable image URLs (Cloudinary).
 * @returns {Promise<{ cropHealthScore: number, model: string, sampleCount: number, images: object[] }>}
 */
const analyzeCropHealth = async ({ imageUrls }) => {
  // No ML endpoint configured -> mocked crop-health score.
  if (!env.aiService.url) {
    return {
      cropHealthScore: env.aiService.mockScore,
      model: 'mock',
      sampleCount: 0,
      images: [],
      mocked: true,
    };
  }

  try {
    const { data } = await axios.post(
      `${env.aiService.url.replace(/\/$/, '')}/analyze`,
      { imageUrls, sampleCount: env.aiService.sampleCount },
      { timeout: env.aiService.timeoutMs }
    );

    if (!data || typeof data.cropHealthScore !== 'number') {
      throw ApiError.badRequest('ML service returned an invalid cropHealthScore.');
    }

    return {
      cropHealthScore: data.cropHealthScore,
      model: data.model || 'unknown',
      sampleCount: data.sampleCount || env.aiService.sampleCount,
      images: Array.isArray(data.images) ? data.images : [],
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, 'Crop-health analysis service is unavailable. Please try again later.');
  }
};

module.exports = { analyzeCropHealth };
