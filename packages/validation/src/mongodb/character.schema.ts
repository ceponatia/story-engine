import { z } from 'zod';

// Schema for Character form data validation
export const characterFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less")
    .trim(),
  age: z.number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(9999, "Age must be 9999 or less")
    .optional(),
  gender: z.enum(["Male", "Female", "Other", "Unknown"])
    .optional(),
  appearance: z.string()
    .min(1, "Appearance is required")
    .trim()
    .optional(),
  scents_aromas: z.string()
    .trim()
    .optional(),
  personality: z.string()
    .min(1, "Personality is required")
    .trim()
    .optional(),
  background: z.string()
    .min(1, "Background is required")
    .trim()
    .optional(),
  avatar_url: z.string()
    .url("Avatar URL must be a valid URL")
    .optional()
    .or(z.literal("")),
  tags: z.string()
    .trim()
    .optional(),
});

// Schema for Character creation (required fields)
export const characterCreateSchema = characterFormSchema.extend({
  name: z.string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less")
    .trim(),
  age: z.number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(9999, "Age must be 9999 or less"),
  appearance: z.string()
    .min(1, "Appearance is required")
    .trim(),
  personality: z.string()
    .min(1, "Personality is required")
    .trim(),
  background: z.string()
    .min(1, "Background is required")
    .trim(),
});

// Schema for Character update (all fields optional except name)
export const characterUpdateSchema = characterFormSchema.extend({
  name: z.string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less")
    .trim(),
});

// Schema for Character document (MongoDB)
export const characterDocumentSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  name: z.string(),
  age: z.number().optional(),
  gender: z.string().optional(),
  appearance: z.record(z.any()).optional(),
  scents_aromas: z.record(z.any()).optional(),
  personality: z.record(z.any()).optional(),
  background: z.string().optional(),
  avatar_url: z.string().optional(),
  tags: z.array(z.string()).optional(),
  user_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// Schema for Character entity (database-agnostic)
export const characterEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().optional(),
  gender: z.string().optional(),
  appearance: z.record(z.any()).optional(),
  scents_aromas: z.record(z.any()).optional(),
  personality: z.record(z.any()).optional(),
  background: z.string().optional(),
  avatar_url: z.string().optional(),
  tags: z.string(),
  private: z.boolean(),
  created_by: z.string(),
  user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// For validating an array of characters
export const characterArraySchema = z.array(characterEntitySchema);

// Export types for TypeScript
export type CharacterFormInput = z.infer<typeof characterFormSchema>;
export type CharacterCreateInput = z.infer<typeof characterCreateSchema>;
export type CharacterUpdateInput = z.infer<typeof characterUpdateSchema>;
export type CharacterDocument = z.infer<typeof characterDocumentSchema>;
export type CharacterEntity = z.infer<typeof characterEntitySchema>;