import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const createBookingSchema = z.object({
  body: z.object({
    station: objectIdSchema,
    charger: objectIdSchema,
    bookingTime: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
      message: 'Booking time must be in the future',
    }),
    durationMinutes: z.number().int().min(15).max(480).optional().default(60),
    vehicleType: z.string().trim().optional(),
    notes: z.string().trim().max(500).optional(),
  }),
});

export const cancelBookingSchema = z.object({
  body: z.object({
    reason: z.string().trim().max(300).optional(),
  }),
});
