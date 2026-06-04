const healthService = require('../services/health.service');

const checkHealth = (req, res, next) => {
  try {
    const health = healthService.getSystemHealth();
    res.status(200).json(health);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkHealth
};
