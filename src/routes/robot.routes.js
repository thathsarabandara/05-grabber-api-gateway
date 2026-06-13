const express = require('express');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const config = require('../config');

const router = express.Router();

router.use(
  '/',
  createProxyMiddleware({
    target: config.services.robot,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      const newPath = `/api/v1/robots${path === '/' ? '' : path}`;
      console.log(`[Robot Proxy] ${req.method} ${req.originalUrl} -> ${newPath}`);
      return newPath;
    },
    on: {
      proxyReq: (proxyReq, req, res) => {
        fixRequestBody(proxyReq, req, res);
      },
      error: (err, req, res) => {
        console.error('[Robot Proxy] Error:', err);
        res.status(500).json({ message: 'Robot service is unavailable' });
      }
    }
  })
);

module.exports = router;
