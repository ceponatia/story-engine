import { z } from "zod";

// Schema for Character document (MongoDB-specific)
export const characterDocumentSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  name: z.string(),
  age: z.number().optional(),
  gender: z.string().optional(),
  appearance: z.record(z.unknown()).optional(),
  scents_aromas: z.record(z.unknown()).optional(),
  personality: z.record(z.unknown()).optional(),
  background: z.string().optional(),
  avatar_url: z.string().optional(),
  tags: z.array(z.string()).optional(),
  user_id: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

// Export types for TypeScript
export type CharacterDocument = z.infer<typeof characterDocumentSchema>;
