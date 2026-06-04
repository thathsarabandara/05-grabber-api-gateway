const app = require('./app');
const config = require('./config');
const { connectDB } = require('./config/db');
const { connectRedis } = require('./config/redis');

const PORT = config.port;

const startServer = async () => {
  // Connect to databases
  await connectDB();
  await connectRedis();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Grabber API Gateway running in ${config.env} mode on port ${PORT}`);
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

startServer();
