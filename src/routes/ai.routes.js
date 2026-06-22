const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const config = require('../config');

const router = express.Router();

// Proxy all requests to AI Service
router.use('/', createProxyMiddleware({
  target: config.services.ai,
  changeOrigin: true,
  pathRewrite: (path, req) => {
    const newPath = `/api/v1/ai${path === '/' ? '' : path}`;
    console.log(`[AI Proxy] ${req.method} ${req.originalUrl} -> ${newPath}`);
    return newPath;
  },
  on: {
    proxyReq: (proxyReq, req, res) => {
      fixRequestBody(proxyReq, req, res);
    },
    error: (err, req, res) => {
      console.error('[AI Proxy] Error:', err);
      if (res && typeof res.status === 'function') {
        res.status(500).json({ message: 'AI service is unavailable' });
      }
    }
  }
}));

module.exports = router;
