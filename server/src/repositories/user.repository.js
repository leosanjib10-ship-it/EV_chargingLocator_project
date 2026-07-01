import { User } from '#models/User';

export const findByEmail = (email, withPassword = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  return withPassword ? query.select('+password') : query;
};

export const findByPhone = (phone) => User.findOne({ phone });

export const findById = (id, withPassword = false) => {
  const query = User.findById(id);
  return withPassword ? query.select('+password') : query;
};

export const createUser = (data) => User.create(data);

export const emailOrPhoneExists = async (email, phone) => {
  return User.findOne({ $or: [{ email: email.toLowerCase() }, { phone }] });
};

export default { findByEmail, findByPhone, findById, createUser, emailOrPhoneExists };
