const express = require('express');
const healthController = require('../controllers/health.controller');

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Get the health status of the service
 * @access Public
 */
router.get('/', healthController.checkHealth);

module.exports = router;
