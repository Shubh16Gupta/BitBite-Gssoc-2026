/**
 * Bank authentication controller.
 * Handles signup (with ID-card upload) and login. Bank accounts default to
 * `Pending` and cannot authenticate until an admin marks them `Approved`.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Bank = require('../models/Bank');
const { signToken } = require('../services/tokenService');

/**
 * Shape the safe (password-free) bank object for responses.
 */
const toSafeBank = (bank) => ({
  id: bank._id,
  institutionType: bank.institutionType,
  institutionName: bank.institutionName,
  branchName: bank.branchName,
  IFSC: bank.IFSC,
  officialEmail: bank.officialEmail,
  employeeId: bank.employeeId,
  designation: bank.designation,
  status: bank.status,
});

/**
 * @route   POST /api/bank/signup
 * @desc    Register a bank user (status = Pending) with an ID-card upload.
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const {
    institutionType,
    institutionName,
    branchName,
    branchAddress,
    IFSC,
    officialEmail,
    employeeId,
    designation,
    password,
  } = req.body;

  // The ID card is mandatory — reject if multer didn't capture it.
  if (!req.file) {
    throw ApiError.badRequest('Employee ID card upload is required.');
  }

  // Prevent duplicate accounts on the same official email.
  const existing = await Bank.findOne({ officialEmail });
  if (existing) {
    throw ApiError.conflict('A bank account with this official email already exists.');
  }

  // Password is hashed by the model's pre-save hook.
  const bank = await Bank.create({
    institutionType,
    institutionName,
    branchName,
    branchAddress,
    IFSC,
    officialEmail,
    employeeId,
    designation,
    password,
    employeeIdCard: req.file.filename,
    status: 'Pending',
  });

  return sendResponse(
    res,
    201,
    'Bank registration submitted. Your account is pending approval.',
    toSafeBank(bank)
  );
});

/**
 * @route   POST /api/bank/login
 * @desc    Authenticate an approved bank user and return a JWT.
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { officialEmail, password } = req.body;

  // Password has select:false, so request it explicitly.
  const bank = await Bank.findOne({ officialEmail }).select('+password');

  // Use a generic message to avoid revealing which accounts exist.
  if (!bank) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const isMatch = await bank.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  // Block unapproved accounts.
  if (bank.status !== 'Approved') {
    throw ApiError.forbidden(
      `Your account is ${bank.status}. You cannot log in until it is approved.`
    );
  }

  const token = signToken({ id: bank._id, role: 'bank' });

  return sendResponse(res, 200, 'Login successful.', {
    token,
    bank: toSafeBank(bank),
  });
});

module.exports = { signup, login };
