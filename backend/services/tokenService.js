/**
 * JWT token service — single source of truth for signing/verifying tokens.
 * Keeping this isolated means the signing algorithm, secret, and payload
 * shape are defined in exactly one place.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Sign a JWT for an authenticated principal.
 *
 * @param {Object} payload - must contain at least { id, role }.
 * @returns {string} signed JWT
 */
const signToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

/**
 * Verify and decode a JWT. Throws if invalid/expired.
 *
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

module.exports = { signToken, verifyToken };
