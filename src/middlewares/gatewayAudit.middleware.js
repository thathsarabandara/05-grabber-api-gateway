const { ApiAuditEvent } = require('../models');

const gatewayAudit = (action, resourceType) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      // Only log audit event if the action was successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await ApiAuditEvent.create({
            user_id: req.user?.id || null,
            action: action,
            resource_type: resourceType,
            resource_id: req.params.id || null, // Best guess from route params
          });
        } catch (error) {
          console.error('Failed to write audit log:', error);
        }
      }
    });
    next();
  };
};

module.exports = gatewayAudit;
