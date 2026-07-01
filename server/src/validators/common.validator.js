import { z } from 'zod';
import { NEPAL_PHONE_REGEX, PASSWORD_REGEX, ALL_ROLES } from '#config/constants';

export const phoneSchema = z
  .string()
  .trim()
  .regex(NEPAL_PHONE_REGEX, 'Enter a valid Nepal mobile number (e.g. 98XXXXXXXX or +977 98XXXXXXXX)');

export const passwordSchema = z
  .string()
  .regex(
    PASSWORD_REGEX,
    'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character'
  );

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

export const roleSchema = z.enum(ALL_ROLES);

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid identifier');

export const coordinatesSchema = z
  .array(z.number())
  .length(2, 'Coordinates must be [longitude, latitude]')
  .refine(([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90, {
    message: 'Coordinates out of valid range',
  });
