const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApiAuditEvent = sequelize.define('ApiAuditEvent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  resource_type: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'api_audit_events',
  timestamps: false,
});

module.exports = ApiAuditEvent;
