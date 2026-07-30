/**
 * One-off seed script to create the initial admin account.
 * Run with:  npm run seed:admin
 *
 * Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from the environment.
 * Idempotent — if an admin with that email already exists, it is left untouched.
 */
const mongoose = require('mongoose');
const env = require('./env');
const connectDB = require('./db');
const Admin = require('../models/Admin');

const seedAdmin = async () => {
  const { name, email, password } = env.seedAdmin;

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error('❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  await connectDB();

  const existing = await Admin.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`ℹ️  Admin already exists: ${email}. Nothing to do.`);
  } else {
    // Password is hashed by the model's pre-save hook.
    await Admin.create({ name, email, password });
    // eslint-disable-next-line no-console
    console.log(`✅ Admin created: ${email}`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

seedAdmin().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('💥 Seed failed:', err.message);
  await mongoose.connection.close();
  process.exit(1);
});
