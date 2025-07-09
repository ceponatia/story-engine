import { z } from "zod";

// Schema for Character entity (database-agnostic)
export const characterEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().optional(),
  gender: z.string().optional(),
  appearance: z.record(z.unknown()).optional(),
  scents_aromas: z.record(z.unknown()).optional(),
  personality: z.record(z.unknown()).optional(),
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
export type CharacterEntity = z.infer<typeof characterEntitySchema>;
