import { z } from "zod";

export const SettingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Setting name is required").max(100, "Setting name too long"),
  description: z.string().min(1, "Description is required").max(2000, "Description too long"),
  genre: z.string().optional(),
  elements: z.array(z.string()).optional().default([]),
  political: z.array(z.string()).optional().default([]),
  cultural: z.array(z.string()).optional().default([]),
  economic: z.array(z.string()).optional().default([]),
  history: z.array(z.string()).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
});

export const CreateSettingSchema = SettingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateSettingSchema = SettingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).partial();

export const SettingFilterSchema = z.object({
  name: z.string().optional(),
  genre: z.string().optional(),
  elements: z.array(z.string()).optional(),
  createdBy: z.string().optional(),
});

export type SettingData = z.infer<typeof SettingSchema>;
export type CreateSettingData = z.infer<typeof CreateSettingSchema>;
export type UpdateSettingData = z.infer<typeof UpdateSettingSchema>;
export type SettingFilterData = z.infer<typeof SettingFilterSchema>;
