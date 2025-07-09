import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Location name is required").max(100, "Location name too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  features: z.array(z.string()).optional().default([]),
  atmosphere: z.string().optional(),
  resources: z.array(z.string()).optional().default([]),
  structures: z.array(z.string()).optional().default([]),
  natural: z.array(z.string()).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
});

export const CreateLocationSchema = LocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateLocationSchema = LocationSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).partial();

export const LocationFilterSchema = z.object({
  name: z.string().optional(),
  features: z.array(z.string()).optional(),
  atmosphere: z.string().optional(),
  createdBy: z.string().optional(),
});

export type LocationData = z.infer<typeof LocationSchema>;
export type CreateLocationData = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationData = z.infer<typeof UpdateLocationSchema>;
export type LocationFilterData = z.infer<typeof LocationFilterSchema>;
