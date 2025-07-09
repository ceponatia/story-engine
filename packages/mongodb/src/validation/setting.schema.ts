import { z } from "zod";

// Schema for Setting document (MongoDB-specific)
export const settingDocumentSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  name: z.string(),
  description: z.string().optional(),
  climate: z.string().optional(),
  terrain: z.string().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

// For validating an array of settings
export const settingArraySchema = z.array(settingDocumentSchema);

// Export types for TypeScript
export type SettingDocument = z.infer<typeof settingDocumentSchema>;
