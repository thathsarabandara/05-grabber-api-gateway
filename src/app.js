const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { metricsMiddleware, register } = require('./middlewares/metrics.middleware');
const errorHandler = require('./middlewares/error.middleware');
const healthRoutes = require('./routes/health.routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Metrics Middleware
app.use(metricsMiddleware);

// Routes
app.use('/api/health', healthRoutes);

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
