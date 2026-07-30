/**
 * Market price route: GET /api/farmer/market-price
 */
const express = require('express');

const router = express.Router();

const { verifyFarmer } = require('../middleware/authMiddleware');
const { getMarketPrice } = require('../controllers/marketController');

router.get('/', verifyFarmer, getMarketPrice);

module.exports = router;
