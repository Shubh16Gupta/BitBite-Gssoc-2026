/**
 * Reset the admin account's password to a known value.
 *
 * Usage:
 *   node config/resetAdminPassword.js "NewPass@123"
 *   npm run reset:admin -- "NewPass@123"
 *
 * Falls back to ADMIN_RESET_PASSWORD or a default if no argument is given.
 * Targets the admin whose email is SEED_ADMIN_EMAIL (config/env.js).
 */
const mongoose = require('mongoose');
const env = require('./env');
const Admin = require('../models/Admin');

const NEW_PASSWORD = process.argv[2] || process.env.ADMIN_RESET_PASSWORD || 'Admin@12345';

(async () => {
  try {
    await mongoose.connect(env.mongoUri);
    const admin = await Admin.findOne({ email: env.seedAdmin.email }).select('+password');
    if (!admin) {
      // eslint-disable-next-line no-console
      console.error(`❌ No admin found for ${env.seedAdmin.email}. Run "npm run seed:admin" first.`);
      process.exit(1);
    }
    admin.password = NEW_PASSWORD; // hashed by the model's pre-save hook
    await admin.save();
    // eslint-disable-next-line no-console
    console.log(`✅ Admin password reset.\n   email:    ${admin.email}\n   password: ${NEW_PASSWORD}`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ Reset failed:', err.message);
    process.exit(1);
  }
})();
