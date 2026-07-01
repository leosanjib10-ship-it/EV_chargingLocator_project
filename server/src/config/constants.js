export const ROLES = Object.freeze({
  USER: 'user',
  STATION_OWNER: 'station_owner',
  ADMIN: 'admin',
});

export const ALL_ROLES = Object.values(ROLES);

// Nepal mobile numbers: 97/98 prefixed 10-digit numbers, optional +977 country code
export const NEPAL_PHONE_REGEX = /^(\+977)?(9[678]\d{8})$/;

// Min 8 chars, at least one uppercase, one lowercase, one digit, one special character
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const BCRYPT_SALT_ROUNDS = 12;

export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
export const REFRESH_TOKEN_EXPIRY = `${REFRESH_TOKEN_EXPIRY_DAYS}d`;

export const COOKIE_NAMES = Object.freeze({
  REFRESH_TOKEN: 'refreshToken',
});

export const RATE_LIMITS = Object.freeze({
  LOGIN: { windowMs: 2 * 60 * 1000, max: 5 },
  REGISTER: { windowMs: 15 * 60 * 1000, max: 10 },
  GENERAL: { windowMs: 15 * 60 * 1000, max: 100 },
});
