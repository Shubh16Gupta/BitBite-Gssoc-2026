/**
 * Admin controller.
 * Handles admin login plus review of bank registrations
 * (list, approve, reject). Bank users cannot log in until an admin
 * flips their status to "Approved".
 */
const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Admin = require('../models/Admin');
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
  branchAddress: bank.branchAddress,
  IFSC: bank.IFSC,
  officialEmail: bank.officialEmail,
  employeeId: bank.employeeId,
  designation: bank.designation,
  employeeIdCard: bank.employeeIdCard,
  status: bank.status,
  createdAt: bank.createdAt,
});

/**
 * @route   POST /api/admin/login
 * @desc    Authenticate an admin and return a JWT.
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Password has select:false, so request it explicitly.
  const admin = await Admin.findOne({ email }).select('+password');

  // Generic message to avoid revealing which accounts exist.
  if (!admin) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const token = signToken({ id: admin._id, role: 'admin' });

  return sendResponse(res, 200, 'Login successful.', {
    token,
    admin: { id: admin._id, name: admin.name, email: admin.email },
  });
});

/**
 * @route   GET /api/admin/banks
 * @desc    List bank registrations, optionally filtered by ?status=Pending.
 * @access  Admin
 */
const listBanks = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter = {};
  if (status) {
    const allowed = Bank.BANK_STATUS || ['Pending', 'Approved', 'Rejected'];
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(`Invalid status filter. Allowed: ${allowed.join(', ')}`);
    }
    filter.status = status;
  }

  const banks = await Bank.find(filter).sort({ createdAt: -1 });

  return sendResponse(res, 200, 'Bank registrations fetched.', {
    count: banks.length,
    banks: banks.map(toSafeBank),
  });
});

/**
 * Shared helper to transition a bank's status.
 */
const updateBankStatus = async (bankId, newStatus) => {
  const bank = await Bank.findById(bankId);
  if (!bank) {
    throw ApiError.notFound('Bank registration not found.');
  }

  // Idempotency guard — avoid redundant transitions.
  if (bank.status === newStatus) {
    throw ApiError.badRequest(`Bank is already ${newStatus}.`);
  }

  bank.status = newStatus;
  await bank.save();
  return bank;
};

/**
 * @route   PATCH /api/admin/banks/:id/approve
 * @desc    Approve a pending bank registration.
 * @access  Admin
 */
const approveBank = asyncHandler(async (req, res) => {
  const bank = await updateBankStatus(req.params.id, 'Approved');
  return sendResponse(res, 200, 'Bank approved successfully.', toSafeBank(bank));
});

/**
 * @route   PATCH /api/admin/banks/:id/reject
 * @desc    Reject a bank registration.
 * @access  Admin
 */
const rejectBank = asyncHandler(async (req, res) => {
  const bank = await updateBankStatus(req.params.id, 'Rejected');
  return sendResponse(res, 200, 'Bank rejected successfully.', toSafeBank(bank));
});

// --- Insurer review (same onboarding flow as banks) ---

const Insurer = require('../models/Insurer');

const toSafeInsurer = (insurer) => ({
  _id: insurer._id,
  insurerType: insurer.insurerType,
  companyName: insurer.companyName,
  branchName: insurer.branchName,
  branchAddress: insurer.branchAddress,
  licenseNumber: insurer.licenseNumber,
  officialEmail: insurer.officialEmail,
  employeeId: insurer.employeeId,
  designation: insurer.designation,
  status: insurer.status,
  createdAt: insurer.createdAt,
});

/**
 * @route   GET /api/admin/insurers
 * @access  Admin
 */
const listInsurers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) {
    const allowed = ['Pending', 'Approved', 'Rejected'];
    if (!allowed.includes(status)) {
      throw ApiError.badRequest(`Invalid status filter. Allowed: ${allowed.join(', ')}`);
    }
    filter.status = status;
  }

  const insurers = await Insurer.find(filter).sort({ createdAt: -1 });
  return sendResponse(res, 200, 'Insurer registrations fetched.', {
    count: insurers.length,
    insurers: insurers.map(toSafeInsurer),
  });
});

const updateInsurerStatus = async (insurerId, newStatus) => {
  const insurer = await Insurer.findById(insurerId);
  if (!insurer) throw ApiError.notFound('Insurer registration not found.');
  if (insurer.status === newStatus) {
    throw ApiError.badRequest(`Insurer is already ${newStatus}.`);
  }
  insurer.status = newStatus;
  await insurer.save();
  return insurer;
};

/**
 * @route   PATCH /api/admin/insurers/:id/approve
 * @access  Admin
 */
const approveInsurer = asyncHandler(async (req, res) => {
  const insurer = await updateInsurerStatus(req.params.id, 'Approved');
  return sendResponse(res, 200, 'Insurer approved successfully.', toSafeInsurer(insurer));
});

/**
 * @route   PATCH /api/admin/insurers/:id/reject
 * @access  Admin
 */
const rejectInsurer = asyncHandler(async (req, res) => {
  const insurer = await updateInsurerStatus(req.params.id, 'Rejected');
  return sendResponse(res, 200, 'Insurer rejected successfully.', toSafeInsurer(insurer));
});

module.exports = {
  login,
  listBanks,
  approveBank,
  rejectBank,
  listInsurers,
  approveInsurer,
  rejectInsurer,
};
