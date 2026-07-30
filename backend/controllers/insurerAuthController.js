/**
 * Insurer authentication controller.
 * Signup creates a `Pending` account; an admin must approve it before login.
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Insurer = require('../models/Insurer');
const { signToken } = require('../services/tokenService');

const toSafeInsurer = (insurer) => ({
  id: insurer._id,
  insurerType: insurer.insurerType,
  companyName: insurer.companyName,
  branchName: insurer.branchName,
  licenseNumber: insurer.licenseNumber,
  officialEmail: insurer.officialEmail,
  employeeId: insurer.employeeId,
  designation: insurer.designation,
  status: insurer.status,
  minAnnScore: insurer.minAnnScore,
});

/**
 * @route   POST /api/insurer/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const {
    insurerType, companyName, branchName, branchAddress,
    licenseNumber, officialEmail, employeeId, designation, password,
  } = req.body;

  const existing = await Insurer.findOne({ officialEmail });
  if (existing) {
    throw ApiError.conflict('An insurer account with this official email already exists.');
  }

  const insurer = await Insurer.create({
    insurerType, companyName, branchName, branchAddress,
    licenseNumber, officialEmail, employeeId, designation, password,
    status: 'Pending',
  });

  return sendResponse(
    res,
    201,
    'Insurer registration submitted. Your account is pending admin approval.',
    toSafeInsurer(insurer)
  );
});

/**
 * @route   POST /api/insurer/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { officialEmail, password } = req.body;

  const insurer = await Insurer.findOne({ officialEmail }).select('+password');
  if (!insurer) throw ApiError.unauthorized('Invalid email or password.');

  const isMatch = await insurer.comparePassword(password);
  if (!isMatch) throw ApiError.unauthorized('Invalid email or password.');

  if (insurer.status !== 'Approved') {
    throw ApiError.forbidden(
      `Your account is ${insurer.status}. You cannot log in until it is approved.`
    );
  }

  const token = signToken({ id: insurer._id, role: 'insurer' });
  return sendResponse(res, 200, 'Login successful.', { token, insurer: toSafeInsurer(insurer) });
});

module.exports = { signup, login, toSafeInsurer };
