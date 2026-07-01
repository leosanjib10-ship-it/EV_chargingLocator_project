import { z } from 'zod';
import { objectIdSchema } from './common.validator.js';

export const createChargerSchema = z.object({
  body: z.object({
    station: objectIdSchema,
    portNumber: z.string().trim().optional(),
    connectorType: z.enum(['CCS', 'CHAdeMO', 'Type2', 'J1772', 'Tesla', 'GBT']),
    chargeLevel: z.enum(['Level1', 'Level2', 'DC_Fast']),
    powerKw: z.number().positive().optional(),
    voltage: z.number().positive().optional(),
    amperage: z.number().positive().optional(),
    pricing: z
      .object({
        perKwh: z.number().min(0).optional(),
        perMinute: z.number().min(0).optional(),
        sessionFee: z.number().min(0).optional(),
        currency: z.string().optional(),
        freeCharging: z.boolean().optional(),
      })
      .optional(),
    notes: z.string().trim().optional(),
  }),
});

export const updatePortStatusSchema = z.object({
  body: z.object({
    availability: z.enum(['available', 'occupied', 'offline', 'reserved']),
  }),
});
