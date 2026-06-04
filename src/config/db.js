const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(
  config.db.name,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize: MySQL Database connected successfully');
    
    // Import models to ensure they are registered with Sequelize
    require('../models');

    // In development, sync models (create tables if they don't exist)
    if (config.env === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Sequelize: All models synchronized');
    }
  } catch (error) {
    console.error('❌ Sequelize: MySQL Connection error:', error.message);
  }
};

module.exports = {
  sequelize,
  connectDB
};
