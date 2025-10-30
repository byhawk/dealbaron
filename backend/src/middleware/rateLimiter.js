const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter: 100 requests per minute per user
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use IP address for unauthenticated requests, user ID for authenticated
  keyGenerator: (req) => {
    return req.playerId || req.ip;
  },
});

/**
 * Strict rate limiter for authentication endpoints: 5 requests per minute per IP
 */
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    error: 'Too Many Login Attempts',
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Market listing rate limiter: 10 requests per minute per user
 */
const marketListingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    error: 'Too Many Market Operations',
    message: 'Market operation rate limit exceeded. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.playerId || req.ip;
  },
});

/**
 * Production operation rate limiter: 20 requests per minute per user
 */
const productionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    error: 'Too Many Production Operations',
    message: 'Production operation rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.playerId || req.ip;
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  marketListingLimiter,
  productionLimiter,
};
