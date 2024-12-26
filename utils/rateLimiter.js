import rateLimit from 'express-rate-limit';

/**
 * Default rate-limiting options
 */
const defaultRateLimiterOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
};

/**
 * Create a rate limiter middleware with custom options
 * @param {Object} options - Custom rate limiting options
 * @returns {Function} Rate limiter middleware
 */
export const createRateLimiter = (options = {}) => {
  return rateLimit({ ...defaultRateLimiterOptions, ...options });
};

/**
 * Specific rate limiter for sensitive routes (e.g., login, registration)
 */
export const sensitiveRouteLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: 'Too many attempts, please try again later.',
});
