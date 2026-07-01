import { NEPAL_PHONE_REGEX } from '#config/constants';

export const isValidNepalPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  return NEPAL_PHONE_REGEX.test(phone.trim());
};

// Normalizes a valid Nepal mobile number to +977XXXXXXXXXX
export const normalizeNepalPhone = (phone) => {
  const trimmed = phone.trim();
  const match = trimmed.match(NEPAL_PHONE_REGEX);
  if (!match) return null;
  return `+977${match[2]}`;
};

export default { isValidNepalPhone, normalizeNepalPhone };
