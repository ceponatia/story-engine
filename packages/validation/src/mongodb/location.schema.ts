import { z } from 'zod';

export const locationSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  name: z.string(),
  description: z.string().optional(),
  region: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

// For validating an array of locations
export const locationArraySchema = z.array(locationSchema);