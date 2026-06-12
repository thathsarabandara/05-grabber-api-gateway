const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const config = require('../config');

const router = express.Router();

router.use(
  '/',
  createProxyMiddleware({
    target: config.services.auth,
    changeOrigin: true,
    pathRewrite: {
      '^/': '/api/v1/auth/', // Prepend the prefix that Express stripped out
    },
    on: {
      proxyReq: fixRequestBody,
      error: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).json({ message: 'Auth service is unavailable' });
      }
    }
  })
);

module.exports = router;
