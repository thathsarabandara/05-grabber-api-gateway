const ApiGatewayLog = require('./api_gateway_log.model');
const ApiRateLimit = require('./api_rate_limit.model');
const ApiAuditEvent = require('./api_audit_event.model');

// Define associations if needed

const models = {
  ApiGatewayLog,
  ApiRateLimit,
  ApiAuditEvent,
};

module.exports = models;
