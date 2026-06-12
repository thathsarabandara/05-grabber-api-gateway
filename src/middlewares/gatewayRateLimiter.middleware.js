const { Op } = require('sequelize');
const { ApiRateLimit } = require('../models');

const WINDOW_MINUTES = 15;
const MAX_REQUESTS = 100; // Limit per user per route

const gatewayRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const route = req.originalUrl || req.url;
    
    // DB-backed rate limiter is best used for authenticated users
    // If no user, we let the IP-based express-rate-limit handle it
    if (!userId) {
      return next();
    }

    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
    
    // Find active rate limit window for this user and route
    const [rateLimit, created] = await ApiRateLimit.findOrCreate({
      where: {
        user_id: userId,
        route: route,
        window_start: {
          [Op.gt]: windowStart
        }
      },
      defaults: {
        user_id: userId,
        route: route,
        request_count: 1,
        window_start: new Date()
      }
    });

    if (!created) {
      // Increment request count
      rateLimit.request_count += 1;
      await rateLimit.save();

      if (rateLimit.request_count > MAX_REQUESTS) {
        return res.status(429).json({ 
          error: 'Rate limit exceeded for this user.',
          retryAfter: WINDOW_MINUTES * 60
        });
      }
    }

    next();
  } catch (error) {
    console.error('Database Rate Limiter Error:', error);
    // On DB failure, let the request pass to not block the gateway completely
    next();
  }
};

module.exports = gatewayRateLimiter;
