/**
 * Standardized success-response sender.
 * Guarantees every endpoint returns the same envelope:
 *   { success, message, data }
 */
const sendResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

module.exports = sendResponse;
