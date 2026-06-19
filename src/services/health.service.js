const os = require('os');

const config = require('../config');

const checkServiceHealth = async (url) => {
  try {
    const response = await fetch(`${url}/api/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    if (response.ok) {
      return 'ONLINE';
    }
  } catch (err) {
    // Service is offline or unreachable
    console.error(`Health check failed for ${url}: ${err.message}`);
  }
  return 'OFFLINE';
};

const getSystemHealth = async () => {
  const downstreamStatus = {};
  
  // Check health of all configured downstream services
  const serviceChecks = Object.entries(config.services).map(async ([serviceName, serviceUrl]) => {
    downstreamStatus[serviceName] = await checkServiceHealth(serviceUrl);
  });
  
  await Promise.all(serviceChecks);

  return {
    status: 'UP',
    timestamp: new Date().toISOString(),
    system: {
      platform: process.platform,
      uptime: process.uptime(),
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      loadAverage: os.loadavg(),
    },
    service: {
      name: 'grabber-api-gateway',
      version: '1.0.0',
    },
    downstream: downstreamStatus
  };
};

module.exports = {
  getSystemHealth
};
