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
  services: {
    auth: process.env.AUTH_SERVICE_URL || 'http://auth-service:8001',
    robot: process.env.ROBOT_SERVICE_URL || 'http://robot-service:8002',
    telemetry: process.env.TELEMETRY_SERVICE_URL || 'http://telemetry-service:8003',
    ai: process.env.AI_SERVICE_URL || 'http://ai-service:8004',
  }
};

module.exports = config;
