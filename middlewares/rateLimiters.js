
import rateLimit from 'express-rate-limit';

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: 'Too many requests from this IP. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const loginRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: 'Too many failed login attempts. Try again after 5 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 300,
    message: options.message || 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};
