require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  jwt: {
    secret: process.env.JWT_SECRET || 'secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'grabber_gateway',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
};

module.exports = config;
