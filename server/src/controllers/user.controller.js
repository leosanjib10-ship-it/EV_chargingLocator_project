import { User } from '#models/User';
import ApiResponse from '#utils/ApiResponse';
import ApiError from '#utils/ApiError';
import asyncHandler from '#utils/asyncHandler';
import { hashPassword, comparePassword } from '#utils/password';
import { normalizeNepalPhone, isValidNepalPhone } from '#utils/phone';
import * as tokenService from '#services/token.service';

const sanitize = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

// ─── Get All Users (admin) ────────────────────────────────────────
export const getAllUsers = asyncHandler(async (req, res) => {
  const { isActive, role, page = 1, limit = 20, search } = req.query;

  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Users fetched successfully', {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    })
  );
});

// ─── Get User by ID ────────────────────────────────────────
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json(new ApiResponse(200, 'User fetched successfully', user));
});

// ─── Update Own/Admin-managed User Profile ────────────────────────
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, phone, isActive, avatar, vehicleType, businessName, location } = req.body;

  if (req.user.role !== 'admin' && String(req.user._id) !== String(id)) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  const user = await User.findById(id);
  if (!user) throw new ApiError(404, 'User not found');

  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (vehicleType !== undefined) user.vehicleType = vehicleType;
  if (businessName !== undefined) user.businessName = businessName;
  if (location !== undefined) user.location = location;

  if (phone) {
    if (!isValidNepalPhone(phone)) {
      throw new ApiError(400, 'Invalid Nepal phone number');
    }
    const normalized = normalizeNepalPhone(phone);
    const existing = await User.findOne({ phone: normalized, _id: { $ne: id } });
    if (existing) throw new ApiError(409, 'Phone number already in use');
    user.phone = normalized;
  }

  if (isActive !== undefined && req.user.role === 'admin') {
    user.isActive = isActive;
  }

  const updatedUser = await user.save();
  res.status(200).json(new ApiResponse(200, 'User updated successfully', sanitize(updatedUser)));
});

// ─── Change Password ────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (req.user.role !== 'admin' && String(req.user._id) !== String(id)) {
    throw new ApiError(403, 'You can only change your own password');
  }

  const user = await User.findById(id).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isValid = await comparePassword(oldPassword, user.password);
  if (!isValid) throw new ApiError(401, 'Current password is incorrect');

  user.password = await hashPassword(newPassword);
  await user.save();

  await tokenService.revokeAllUserTokens(user._id);

  res.status(200).json(new ApiResponse(200, 'Password changed successfully', null));
});

// ─── Deactivate User (admin) ────────────────────────────────────────
export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = false;
  await user.save();
  await tokenService.revokeAllUserTokens(user._id);

  res.status(200).json(new ApiResponse(200, 'User deactivated successfully', sanitize(user)));
});

// ─── Reactivate User (admin) ────────────────────────────────────────
export const reactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  user.isActive = true;
  await user.save();

  res.status(200).json(new ApiResponse(200, 'User reactivated successfully', sanitize(user)));
});

// ─── Delete User (admin) ────────────────────────────────────────
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');

  res.status(200).json(new ApiResponse(200, 'User deleted successfully', null));
});

// ─── User Statistics (admin) ────────────────────────────────────────
export const getUserStatistics = asyncHandler(async (req, res) => {
  const [total, active, inactive] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'User statistics fetched successfully', { total, active, inactive })
  );
});

// ─── Search Users (admin) ────────────────────────────────────────
export const searchUsers = asyncHandler(async (req, res) => {
  const { query, page = 1, limit = 10 } = req.query;
  if (!query) throw new ApiError(400, 'Search query is required');

  const filter = {
    $or: [{ name: { $regex: query, $options: 'i' } }, { email: { $regex: query, $options: 'i' } }],
  };
  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(Number(limit)).sort({ name: 1 }),
    User.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, 'Users fetched successfully', {
      users,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    })
  );
});
