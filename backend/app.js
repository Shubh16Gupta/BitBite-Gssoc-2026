/**
 * Express application factory.
 * Wires security middleware, body parsing, static uploads, routes, and the
 * centralized error handlers. `server.js` imports this and starts listening.
 */
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const sendResponse = require('./utils/ApiResponse');

const app = express();

// --- Security headers ---
app.use(helmet());

// --- CORS ---
// Supports a comma-separated allowlist or "*" for all origins.
const corsOrigins =
  env.corsOrigin === '*' ? '*' : env.corsOrigin.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);

// --- Body parsers ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// --- NoSQL injection protection ---
// Strips keys containing '$' or '.' from req.body/params/query.
app.use(mongoSanitize());

// --- Rate limiting (applied to the API surface) ---
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMinutes * 60 * 1000,
  max: env.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});
app.use('/api', limiter);

// --- Static access to uploaded documents ---
// These files are served by absolute URL to other origins (the frontend when it
// is not behind the dev proxy, and the ML service), so helmet's default
// same-origin resource policy would stop browsers rendering them. Relax it for
// this mount only — the rest of the API keeps helmet's defaults.
app.use(
  '/uploads',
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
  express.static(path.join(__dirname, 'uploads'))
);

// --- Health check ---
app.get('/health', (_req, res) =>
  sendResponse(res, 200, 'FarmTrust API is healthy.', {
    uptime: process.uptime(),
    environment: env.nodeEnv,
  })
);

// --- API routes ---
app.use('/api', apiRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
