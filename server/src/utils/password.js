import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '#config/constants';

export const hashPassword = async (plainPassword) => {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export default { hashPassword, comparePassword };
