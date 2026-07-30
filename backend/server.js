/**
 * Server bootstrap.
 * Connects to MongoDB, starts the HTTP server, and installs process-level
 * guards for unhandled rejections and graceful shutdown.
 */
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  // Ensure the DB is reachable before accepting traffic.
  await connectDB();

  const server = app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`🚀 FarmTrust API running on port ${env.port} [${env.nodeEnv}]`);

    // Make the active image-storage backend obvious — local disk only works for
    // a single host, so deployments should always run on Cloudinary.
    if (env.cloudinary.configured) {
      // eslint-disable-next-line no-console
      console.log(`🖼️  Image storage: Cloudinary (cloud: ${env.cloudinary.cloudName})`);
    } else {
      // eslint-disable-next-line no-console
      console.warn(
        '🖼️  Image storage: LOCAL DISK (/uploads) — set CLOUDINARY_* in .env before deploying.'
      );
    }
  });

  // Crash-safe: log and shut down on unexpected promise rejections.
  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('💥 Unhandled Rejection:', reason);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on termination signals.
  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      // eslint-disable-next-line no-console
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };
  ['SIGINT', 'SIGTERM'].forEach((sig) => process.on(sig, () => shutdown(sig)));
};

startServer();
