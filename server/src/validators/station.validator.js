import { z } from 'zod';
import { coordinatesSchema } from './common.validator.js';

const addressSchema = z.object({
  street: z.string().trim().min(1, 'Street is required'),
  city: z.string().trim().min(1, 'City is required'),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  zipCode: z.string().trim().optional(),
  formatted: z.string().trim().optional(),
});

const locationSchema = z.object({
  type: z.literal('Point').optional(),
  coordinates: coordinatesSchema,
});

export const createStationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Station name is required'),
    description: z.string().trim().optional(),
    address: addressSchema,
    location: locationSchema,
    photos: z.array(z.string()).optional(),
    operatingHours: z.array(z.any()).optional(),
    amenities: z.array(z.any()).optional(),
    network: z.string().trim().optional(),
    accessType: z.enum(['public', 'semi_public', 'private']).optional(),
    accessInstructions: z.string().trim().optional(),
  }),
});

export const updateStationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    description: z.string().trim().optional(),
    address: addressSchema.partial().optional(),
    photos: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive', 'maintenance', 'coming_soon']).optional(),
    operatingHours: z.array(z.any()).optional(),
    amenities: z.array(z.any()).optional(),
    network: z.string().trim().optional(),
    accessType: z.enum(['public', 'semi_public', 'private']).optional(),
    accessInstructions: z.string().trim().optional(),
    is24Hours: z.boolean().optional(),
  }),
});
