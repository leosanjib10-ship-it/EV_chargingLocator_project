import { env } from '#config/env';
import { COOKIE_NAMES, REFRESH_TOKEN_EXPIRY_DAYS } from '#config/constants';

const isProd = env.NODE_ENV === 'production';

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/api/account',
  maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
};

export const setRefreshTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, refreshCookieOptions);
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { ...refreshCookieOptions, maxAge: undefined });
};

export default { setRefreshTokenCookie, clearRefreshTokenCookie, refreshCookieOptions };
