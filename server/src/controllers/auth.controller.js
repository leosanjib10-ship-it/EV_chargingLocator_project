import ApiResponse from '#utils/ApiResponse';
import ApiError from '#utils/ApiError';
import asyncHandler from '#utils/asyncHandler';
import { hashPassword, comparePassword } from '#utils/password';
import { normalizeNepalPhone } from '#utils/phone';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '#utils/cookies';
import * as userRepository from '#repositories/user.repository';
import * as tokenService from '#services/token.service';
import { COOKIE_NAMES } from '#config/constants';

const sanitizeUser = (user) => {
  const obj = typeof user.toObject === 'function' ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

const requestMeta = (req) => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip,
});

// ─── Register ────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role, vehicleType, businessName, location } = req.body;

  const normalizedPhone = normalizeNepalPhone(phone);
  if (!normalizedPhone) {
    throw new ApiError(400, 'Invalid Nepal phone number', ['phone: could not be normalized']);
  }

  const existing = await userRepository.emailOrPhoneExists(email, normalizedPhone);
  if (existing) {
    const field = existing.email === email.toLowerCase() ? 'email' : 'phone';
    throw new ApiError(409, `An account with this ${field} already exists`);
  }

  const hashedPassword = await hashPassword(password);

  const user = await userRepository.createUser({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    phone: normalizedPhone,
    role,
    vehicleType: role === 'user' ? vehicleType : undefined,
    businessName: role === 'station_owner' ? businessName : undefined,
    location: role === 'station_owner' ? location : undefined,
  });

  const { accessToken, refreshToken } = await tokenService.issueTokenPair(user, requestMeta(req));
  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json(
    new ApiResponse(201, 'Account created successfully', {
      user: sanitizeUser(user),
      accessToken,
    })
  );
});

// ─── Login ────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userRepository.findByEmail(email, true);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const { accessToken, refreshToken } = await tokenService.issueTokenPair(user, requestMeta(req));
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json(
    new ApiResponse(200, 'Login successful', {
      user: sanitizeUser(user),
      accessToken,
    })
  );
});

// ─── Refresh Access Token ────────────────────────────────────────
export const refresh = asyncHandler(async (req, res) => {
  const presentedToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
  if (!presentedToken) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const { user, accessToken, refreshToken } = await tokenService.rotateRefreshToken(
    presentedToken,
    requestMeta(req)
  );

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json(
    new ApiResponse(200, 'Token refreshed', {
      user: sanitizeUser(user),
      accessToken,
    })
  );
});

// ─── Logout ────────────────────────────────────────
export const logout = asyncHandler(async (req, res) => {
  const presentedToken = req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN];
  await tokenService.revokeRefreshToken(presentedToken);
  clearRefreshTokenCookie(res);

  res.status(200).json(new ApiResponse(200, 'Logged out successfully', null));
});

// ─── Current User ────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, 'Current user fetched', sanitizeUser(req.user)));
});

// ─── Password reset stub (future work: email delivery) ─────────
export const resetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await userRepository.findByEmail(email);
  // Always respond the same way to avoid leaking which emails are registered.
  res.status(200).json(
    new ApiResponse(200, 'If an account exists for this email, a reset link has been sent', null)
  );
});
