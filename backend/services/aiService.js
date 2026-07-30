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

  const base = env.aiService.url.replace(/\/$/, '');

  const postAnalyze = async () => {
    const { data } = await axios.post(
      `${base}/analyze`,
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
  };

  try {
    return await postAnalyze();
  } catch (firstErr) {
    if (firstErr instanceof ApiError && firstErr.statusCode === 400) throw firstErr;

    // A sleeping free-tier instance is the common case: the host answers 502/503
    // (or the connection times out) while the container spins up, which can take
    // ~30s. Wake it with a cheap GET /health, then retry the analysis once.
    if (isColdStart(firstErr)) {
      // eslint-disable-next-line no-console
      console.warn(
        `⏳ ML service appears asleep (${firstErr.code || firstErr.response?.status}) — waking it and retrying once.`
      );
      try {
        await axios.get(`${base}/health`, { timeout: env.aiService.wakeTimeoutMs });
        return await postAnalyze();
      } catch (retryErr) {
        return handleFailure(retryErr, base, imageUrls);
      }
    }

    return handleFailure(firstErr, base, imageUrls);
  }
};

/**
 * Does this error look like the host turning us away while the instance boots,
 * rather than a genuine fault in the model?
 */
const isColdStart = (err) => {
  const status = err.response?.status;
  return (
    err.code === 'ECONNABORTED' || // our timeout elapsed
    err.code === 'ECONNRESET' ||
    err.code === 'ECONNREFUSED' ||
    status === 502 || // Render's edge while the container starts
    status === 503 ||
    status === 504
  );
};

/** Log the underlying cause and translate it into an ApiError. */
const handleFailure = (err, base, imageUrls) => {
  {
    if (err instanceof ApiError) throw err;

    // Log the real cause — without this the operator only ever sees the generic
    // 502 and cannot tell a cold-start timeout from an unreachable host or a
    // rejection by the ML service itself.
    // eslint-disable-next-line no-console
    console.error('💥 Crop-health analysis failed:', {
      url: `${base}/analyze`,
      code: err.code || null, // ECONNABORTED = timeout, ECONNREFUSED/ENOTFOUND = unreachable
      status: err.response?.status || null,
      detail: err.response?.data?.detail || err.message,
      imageCount: imageUrls.length,
      timeoutMs: env.aiService.timeoutMs,
    });

    // Still cold after a wake attempt — tell the farmer to retry rather than
    // implying the model itself is broken.
    if (isColdStart(err)) {
      throw new ApiError(
        503,
        'Crop-health service is starting up. Please try again in about a minute.'
      );
    }
    throw new ApiError(502, 'Crop-health analysis service is unavailable. Please try again later.');
  }
};

module.exports = { analyzeCropHealth, isColdStart };
