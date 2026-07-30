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

    // Log the real cause — without this the operator only ever sees the generic
    // 502 and cannot tell a cold-start timeout from an unreachable host or a
    // rejection by the ML service itself.
    // eslint-disable-next-line no-console
    console.error('💥 Crop-health analysis failed:', {
      url: `${env.aiService.url.replace(/\/$/, '')}/analyze`,
      code: err.code || null, // ECONNABORTED = timeout, ECONNREFUSED/ENOTFOUND = unreachable
      status: err.response?.status || null,
      detail: err.response?.data?.detail || err.message,
      imageCount: imageUrls.length,
      timeoutMs: env.aiService.timeoutMs,
    });

    // A timeout on a sleeping free-tier instance is worth calling out, since the
    // retry usually succeeds once the service is awake.
    if (err.code === 'ECONNABORTED') {
      throw new ApiError(
        504,
        'Crop-health analysis timed out while the service was waking up. Please try again in a minute.'
      );
    }
    throw new ApiError(502, 'Crop-health analysis service is unavailable. Please try again later.');
  }
};

module.exports = { analyzeCropHealth };
