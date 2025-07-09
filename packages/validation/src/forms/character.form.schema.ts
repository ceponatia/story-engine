import { z } from "zod";

// Schema for Character form data validation (database-agnostic)
export const characterFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less")
    .trim(),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(9999, "Age must be 9999 or less")
    .optional(),
  gender: z.enum(["Male", "Female", "Other", "Unknown"]).optional(),
  appearance: z.string().min(1, "Appearance is required").trim().optional(),
  scents_aromas: z.string().trim().optional(),
  personality: z.string().min(1, "Personality is required").trim().optional(),
  background: z.string().min(1, "Background is required").trim().optional(),
  avatar_url: z.string().url("Avatar URL must be a valid URL").optional().or(z.literal("")),
  tags: z.string().trim().optional(),
});

// Schema for Character creation (required fields)
export const characterCreateSchema = characterFormSchema.extend({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less")
    .trim(),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(1, "Age must be at least 1")
    .max(9999, "Age must be 9999 or less"),
  appearance: z.string().min(1, "Appearance is required").trim(),
  personality: z.string().min(1, "Personality is required").trim(),
  background: z.string().min(1, "Background is required").trim(),
});

// Schema for Character update (all fields optional except name)
export const characterUpdateSchema = characterFormSchema.extend({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less")
    .trim(),
});

// Export types for TypeScript
export type CharacterFormInput = z.infer<typeof characterFormSchema>;
export type CharacterCreateInput = z.infer<typeof characterCreateSchema>;
export type CharacterUpdateInput = z.infer<typeof characterUpdateSchema>;
