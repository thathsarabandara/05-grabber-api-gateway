const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('../config');

const router = express.Router();

// Proxy all requests to Telemetry Service
router.use('/', createProxyMiddleware({
  target: config.services.telemetry,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const newPath = `/api/v1/telemetry${path === '/' ? '' : path}`;
    console.log(`[Telemetry Proxy] ${req.method} ${req.originalUrl} -> ${newPath}`);
    return newPath;
  },
}));

module.exports = router;
