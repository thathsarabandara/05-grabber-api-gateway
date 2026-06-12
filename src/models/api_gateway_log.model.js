const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApiGatewayLog = sequelize.define('ApiGatewayLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  request_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  route: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  status_code: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration_ms: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ip_address: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'api_gateway_logs',
  timestamps: false,
});

module.exports = ApiGatewayLog;
