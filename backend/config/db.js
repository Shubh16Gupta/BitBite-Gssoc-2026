/**
 * MongoDB connection helper (Mongoose).
 * Exposes a single `connectDB` function that the server awaits on startup.
 */
const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    // Strict query keeps stray/typo'd fields out of queries.
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(env.mongoUri);

    // eslint-disable-next-line no-console
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Cannot serve requests without a database — exit so the orchestrator restarts us.
    process.exit(1);
  }
};

module.exports = connectDB;
