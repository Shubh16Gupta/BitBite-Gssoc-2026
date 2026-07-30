/**
 * Authentication middleware.
 *
 * Exposes:
 *   - protect      : verifies a JWT and attaches the decoded payload to req.user
 *   - verifyFarmer : protect + requires role === 'farmer' + loads the Farmer doc
 *   - verifyBank   : protect + requires role === 'bank'   + loads the Bank doc
 *   - verifyAdmin  : protect + requires role === 'admin'  + loads the Admin doc
 */
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../services/tokenService');
const Farmer = require('../models/Farmer');
const Bank = require('../models/Bank');
const Admin = require('../models/Admin');
const Insurer = require('../models/Insurer');

/**
 * Extract a Bearer token from the Authorization header.
 */
const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    return header.split(' ')[1];
  }
  return null;
};

/**
 * Base guard: validate the JWT and set req.user = { id, role, ... }.
 */
const protect = asyncHandler(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw ApiError.unauthorized('Authentication token missing.');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token.');
  }

  req.user = decoded; // { id, role, iat, exp }
  next();
});

/**
 * Farmer-only guard. Confirms the token role and that the farmer still exists.
 */
const verifyFarmer = [
  protect,
  asyncHandler(async (req, _res, next) => {
    if (req.user.role !== 'farmer') {
      throw ApiError.forbidden('Access restricted to farmers.');
    }

    const farmer = await Farmer.findById(req.user.id);
    if (!farmer) {
      throw ApiError.unauthorized('Farmer account no longer exists.');
    }

    req.farmer = farmer;
    next();
  }),
];

/**
 * Bank-only guard. Confirms role, existence, and that the account is Approved.
 */
const verifyBank = [
  protect,
  asyncHandler(async (req, _res, next) => {
    if (req.user.role !== 'bank') {
      throw ApiError.forbidden('Access restricted to bank users.');
    }

    const bank = await Bank.findById(req.user.id);
    if (!bank) {
      throw ApiError.unauthorized('Bank account no longer exists.');
    }

    if (bank.status !== 'Approved') {
      throw ApiError.forbidden(`Bank account is ${bank.status}. Access denied.`);
    }

    req.bank = bank;
    next();
  }),
];

/**
 * Admin-only guard. Confirms role and that the admin still exists.
 */
const verifyAdmin = [
  protect,
  asyncHandler(async (req, _res, next) => {
    if (req.user.role !== 'admin') {
      throw ApiError.forbidden('Access restricted to administrators.');
    }

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      throw ApiError.unauthorized('Admin account no longer exists.');
    }

    req.admin = admin;
    next();
  }),
];

/**
 * Insurer-only guard. Confirms role, existence, and Approved status.
 */
const verifyInsurer = [
  protect,
  asyncHandler(async (req, _res, next) => {
    if (req.user.role !== 'insurer') {
      throw ApiError.forbidden('Access restricted to insurance providers.');
    }

    const insurer = await Insurer.findById(req.user.id);
    if (!insurer) {
      throw ApiError.unauthorized('Insurer account no longer exists.');
    }

    if (insurer.status !== 'Approved') {
      throw ApiError.forbidden(`Insurer account is ${insurer.status}. Access denied.`);
    }

    req.insurer = insurer;
    next();
  }),
];

module.exports = { protect, verifyFarmer, verifyBank, verifyAdmin, verifyInsurer };
