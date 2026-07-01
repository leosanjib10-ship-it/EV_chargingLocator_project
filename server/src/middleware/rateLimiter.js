import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '#config/constants';

const buildLimiter = (config, message) =>
  rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
      errors: [],
    },
  });

export const loginLimiter = buildLimiter(
  RATE_LIMITS.LOGIN,
  'Too many login attempts. Please try again in 2 minutes.'
);

export const registerLimiter = buildLimiter(
  RATE_LIMITS.REGISTER,
  'Too many registration attempts. Please try again in 15 minutes.'
);

export const generalLimiter = buildLimiter(
  RATE_LIMITS.GENERAL,
  'Too many requests. Please slow down and try again shortly.'
);
