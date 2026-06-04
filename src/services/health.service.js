const os = require('os');

const getSystemHealth = () => {
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
    }
  };
};

module.exports = {
  getSystemHealth
};
