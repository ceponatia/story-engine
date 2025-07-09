import { z } from "zod";

// Schema for Location document (MongoDB-specific)
export const locationDocumentSchema = z.object({
  _id: z.string().optional(), // MongoDB ObjectId as string
  name: z.string(),
  description: z.string().optional(),
  region: z.string().optional(),
  tags: z.array(z.string()).optional(),
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
});

// For validating an array of locations
export const locationArraySchema = z.array(locationDocumentSchema);

// Export types for TypeScript
export type LocationDocument = z.infer<typeof locationDocumentSchema>;
