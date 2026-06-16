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

  // Proxy WebSocket upgrades to the Robot Service
  const httpProxy = require('http-proxy');
  const wsProxy = httpProxy.createProxyServer({
    target: config.services.robot,
    ws: true
  });
  
  wsProxy.on('error', (err) => {
    console.error('[WS Proxy] Error forwarding WebSocket connection:', err);
  });

  server.on('upgrade', (req, socket, head) => {
    if (req.url.startsWith('/api/v1/robots/ws')) {
      console.log(`[WS Proxy] Upgrading WebSocket connection for: ${req.url}`);
      wsProxy.ws(req, socket, head);
    }
  });

  // Handle unhandled rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

startServer();
