/**
 * Aggregates all feature route modules under a single router,
 * mounted at /api by app.js.
 */
const express = require('express');

const router = express.Router();

const farmerRoutes = require('./farmerRoutes');
const farmerProfileRoutes = require('./farmerProfileRoutes');
const fieldRoutes = require('./fieldRoutes');
const weeklyAnalysisRoutes = require('./weeklyAnalysisRoutes');
const cropCycleRoutes = require('./cropCycleRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const marketRoutes = require('./marketRoutes');
const insuranceRoutes = require('./insuranceRoutes');
const insurerRoutes = require('./insurerRoutes');
const loanRoutes = require('./loanRoutes');
const bankRoutes = require('./bankRoutes');
const adminRoutes = require('./adminRoutes');

// Farmer auth (send-otp, verify-otp, signup, me) — unchanged.
router.use('/farmer', farmerRoutes);
// Farmer profile completion/management and field (plot) CRUD.
router.use('/farmer/profile', farmerProfileRoutes);
router.use('/farmer/fields', fieldRoutes);
// Weekly Crop Analysis (image upload + weather + AI score).
router.use('/farmer/weekly-analysis', weeklyAnalysisRoutes);
// Crop-cycle pipeline (4 growth phases -> health, weather, rainfall, yield, report).
router.use('/farmer/crop-cycles', cropCycleRoutes);
// Dashboard read APIs: /farmer/dashboard/:fieldId and /farmer/history/:fieldId.
router.use('/farmer', dashboardRoutes);
// Market prices (Agmarknet) for revenue estimates.
router.use('/farmer/market-price', marketRoutes);
// Crop insurance: farmer applications + insurer portal.
router.use('/farmer/insurance', insuranceRoutes);
router.use('/insurer', insurerRoutes);
// Loans: farmer applications to a chosen bank.
router.use('/farmer/loans', loanRoutes);
router.use('/bank', bankRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
