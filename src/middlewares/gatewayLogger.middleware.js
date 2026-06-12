const { v4: uuidv4 } = require('uuid');
const { ApiGatewayLog } = require('../models');

const gatewayLogger = async (req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId; // Attach to request for downstream use

  // Wait for the request to finish to log status code and duration
  res.on('finish', async () => {
    try {
      const durationMs = Date.now() - start;
      const userId = req.user?.id || null; // Assumes auth middleware sets req.user
      
      await ApiGatewayLog.create({
        request_id: requestId,
        user_id: userId,
        route: req.originalUrl || req.url,
        method: req.method,
        status_code: res.statusCode,
        duration_ms: durationMs,
        ip_address: req.ip || req.connection.remoteAddress,
      });
    } catch (error) {
      console.error('Failed to log API request to database:', error);
    }
  });

  next();
};

module.exports = gatewayLogger;
