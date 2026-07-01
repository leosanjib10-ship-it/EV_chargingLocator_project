import jwt from 'jsonwebtoken';
import { env } from '#config/env';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '#config/constants';

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role, type: 'access' }, env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId, type: 'refresh' }, env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

// Backward-compatible alias used by older call sites
export const generateToken = generateAccessToken;
export const verifyToken = verifyAccessToken;
