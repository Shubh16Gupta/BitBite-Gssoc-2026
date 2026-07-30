/**
 * Wraps an async route handler so any rejected promise is forwarded
 * to Express's error-handling middleware via next(), removing the need
 * for a try/catch block in every controller.
 *
 * Usage: router.post('/x', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
