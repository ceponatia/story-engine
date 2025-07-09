import { z } from 'zod';

export const settingSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  name: z.string(),
  description: z.string().optional(),
  climate: z.string().optional(),
  terrain: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

// For validating an array of settings
export const settingArraySchema = z.array(settingSchema);
