const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApiRateLimit = sequelize.define('ApiRateLimit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  route: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  request_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  window_start: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'api_rate_limits',
  timestamps: false,
});

module.exports = ApiRateLimit;
