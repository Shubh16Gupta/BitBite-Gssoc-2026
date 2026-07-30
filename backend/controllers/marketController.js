/**
 * Market price controller.
 * @route   GET /api/farmer/market-price?crop=tomato&state=Maharashtra
 * @desc    Current mandi modal price for a crop (+ optional revenue for a yield).
 * @access  Private (farmer)
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const marketService = require('../services/marketPriceService');

const getMarketPrice = asyncHandler(async (req, res) => {
  const crop = String(req.query.crop || '').trim().toLowerCase();
  if (!crop) throw ApiError.badRequest('Query param "crop" is required (e.g. tomato).');

  const price = await marketService.getPrice(crop, req.query.state);
  if (!price) throw ApiError.notFound(`No market price available for "${crop}".`);

  // Optional: value a given predicted yield (quintals).
  const estimatedYield = req.query.estimatedYield ? Number(req.query.estimatedYield) : null;
  const revenue =
    estimatedYield && !Number.isNaN(estimatedYield)
      ? marketService.estimateRevenue(estimatedYield, price)
      : null;

  return sendResponse(res, 200, 'Market price fetched.', { crop, price, ...(revenue || {}) });
});

module.exports = { getMarketPrice };
