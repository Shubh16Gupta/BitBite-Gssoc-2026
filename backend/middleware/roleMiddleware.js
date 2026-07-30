/**
 * Generic role-based access guard.
 *
 * Use after `protect` (or verifyFarmer/verifyBank) to restrict a route to
 * one or more roles:
 *   router.get('/x', protect, authorizeRoles('bank'), handler)
 */
const ApiError = require('../utils/ApiError');

const authorizeRoles = (...allowedRoles) => (req, _res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have permission to access this resource.'));
  }
  return next();
};

module.exports = authorizeRoles;
