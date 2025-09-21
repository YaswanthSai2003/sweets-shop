const rateLimit = require('express-rate-limit');

// Skip rate limits in development
const skipDev = (req) => process.env.NODE_ENV === 'development';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: { success: false, message: 'Too many requests, try later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDev
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many auth attempts' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDev
});

const purchaseLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many purchase requests' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipDev
});

module.exports = { generalLimiter, authLimiter, purchaseLimiter };
