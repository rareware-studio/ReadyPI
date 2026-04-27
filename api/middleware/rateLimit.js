const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// In-memory store for rate limiting (use Redis in production for multi-server setup)
const rateLimitStore = new Map();

/**
 * Custom rate limiter based on API key and plan tier
 */
const apiKeyRateLimiter = (req, res, next) => {
  if (!req.apiKey) {
    return next(); // Skip if no API key (shouldn't happen after auth middleware)
  }

  const keyId = req.apiKey.id;
  const limit = req.apiKey.rateLimit; // Requests per minute from plan tier
  const windowMs = 60 * 1000; // 1 minute window

  const now = Date.now();
  const windowStart = now - windowMs;

  // Get or create rate limit entry
  if (!rateLimitStore.has(keyId)) {
    rateLimitStore.set(keyId, []);
  }

  const requests = rateLimitStore.get(keyId);

  // Remove requests outside the current window
  const recentRequests = requests.filter(timestamp => timestamp > windowStart);
  rateLimitStore.set(keyId, recentRequests);

  // Check if limit exceeded
  if (recentRequests.length >= limit) {
    logger.warn('Rate limit exceeded', {
      apiKeyId: keyId,
      email: req.apiKey.email,
      limit,
      requests: recentRequests.length
    });

    return res.status(429).json({
      error: {
        message: `Rate limit exceeded. Your plan allows ${limit} requests per minute.`,
        type: 'rate_limit_error',
        code: 'rate_limit_exceeded',
        limit,
        current: recentRequests.length,
        reset_at: new Date(recentRequests[0] + windowMs).toISOString()
      }
    });
  }

  // Add current request timestamp
  recentRequests.push(now);
  rateLimitStore.set(keyId, recentRequests);

  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Remaining', limit - recentRequests.length);
  res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

  next();
};

/**
 * General rate limiter for auth endpoints (signup, login)
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes per IP
  message: {
    error: 'Too many requests from this IP, please try again later',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({
      error: 'Too many authentication attempts',
      message: 'Please try again in 15 minutes'
    });
  }
});

/**
 * Rate limiter for payment endpoints
 */
const paymentRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 payment attempts per hour per IP
  message: {
    error: 'Too many payment attempts',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Cleanup old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  for (const [keyId, requests] of rateLimitStore.entries()) {
    const recentRequests = requests.filter(timestamp => timestamp > fiveMinutesAgo);
    if (recentRequests.length === 0) {
      rateLimitStore.delete(keyId);
    } else {
      rateLimitStore.set(keyId, recentRequests);
    }
  }
}, 5 * 60 * 1000);

module.exports = {
  apiKeyRateLimiter,
  authRateLimiter,
  paymentRateLimiter
};
