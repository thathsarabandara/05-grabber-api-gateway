const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { metricsMiddleware, register } = require('./middlewares/metrics.middleware');
const errorHandler = require('./middlewares/error.middleware');
const healthRoutes = require('./routes/health.routes');
const gatewayLogger = require('./middlewares/gatewayLogger.middleware');
const gatewayRateLimiter = require('./middlewares/gatewayRateLimiter.middleware');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(gatewayLogger);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each IP to 2000 requests per windowMs
  skip: (req) => req.originalUrl.includes('/commands') || req.originalUrl.includes('/ws'),
});
app.use('/api/', limiter);
app.use('/api/', (req, res, next) => {
  if (req.originalUrl.includes('/commands') || req.originalUrl.includes('/ws')) {
    return next();
  }
  return gatewayRateLimiter(req, res, next);
});

// Metrics Middleware
app.use(metricsMiddleware);

const authRoutes = require('./routes/auth.routes');
const robotRoutes = require('./routes/robot.routes');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/robots', robotRoutes);

// Proxy uploads to Auth Service
app.use(
  '/uploads',
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      return '/uploads' + path;
    },
  })
);


// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Error Handling
app.use(errorHandler);

module.exports = app;
