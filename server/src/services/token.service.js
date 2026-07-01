import { RefreshToken } from '#models/RefreshToken';
import { User } from '#models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '#utils/jwt';
import { REFRESH_TOKEN_EXPIRY_DAYS } from '#config/constants';
import ApiError from '#utils/ApiError';

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

export const issueTokenPair = async (user, meta = {}) => {
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  await RefreshToken.create({
    user: user._id,
    token: refreshToken,
    expiresAt: daysFromNow(REFRESH_TOKEN_EXPIRY_DAYS),
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { accessToken, refreshToken };
};

// Rotates a refresh token: verifies it, revokes the old one, issues a new pair.
export const rotateRefreshToken = async (presentedToken, meta = {}) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(presentedToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const stored = await RefreshToken.findOne({ token: presentedToken });
  if (!stored || stored.revoked || stored.expiresAt.getTime() < Date.now()) {
    throw new ApiError(401, 'Refresh token is no longer valid');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, 'User no longer exists or is inactive');
  }

  stored.revoked = true;
  await stored.save();

  const tokens = await issueTokenPair(user, meta);
  return { user, ...tokens };
};

export const revokeRefreshToken = async (presentedToken) => {
  if (!presentedToken) return;
  await RefreshToken.updateOne({ token: presentedToken }, { $set: { revoked: true } });
};

export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany({ user: userId, revoked: false }, { $set: { revoked: true } });
};

export default { issueTokenPair, rotateRefreshToken, revokeRefreshToken, revokeAllUserTokens };
