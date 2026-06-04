const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'robotic_arm',
  },
  status: {
    type: DataTypes.ENUM('online', 'offline', 'maintenance', 'error'),
    defaultValue: 'offline',
  },
  lastConnected: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  firmwareVersion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: 'devices',
});

module.exports = Device;
