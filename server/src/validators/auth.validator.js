import { z } from 'zod';
import { emailSchema, passwordSchema, phoneSchema, roleSchema } from './common.validator.js';

export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
      email: emailSchema,
      phone: phoneSchema,
      password: passwordSchema,
      role: roleSchema.optional().default('user'),
      vehicleType: z.string().trim().optional(),
      businessName: z.string().trim().optional(),
      location: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === 'station_owner' && !data.businessName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business name is required for station owners',
          path: ['businessName'],
        });
      }
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z.string().min(1, 'Current password is required'),
      newPassword: passwordSchema,
      confirmPassword: z.string().min(1, 'Please confirm your new password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'New password and confirmation do not match',
      path: ['confirmPassword'],
    }),
});
