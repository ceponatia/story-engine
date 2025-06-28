import { z } from "zod"

export const locationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().min(1, "Description is required").max(2000, "Description must be 2000 characters or less"),
  location_type: z.string().max(50, "Location type must be 50 characters or less").optional().or(z.literal("")),
  geography: z.string().max(1000, "Geography description must be 1000 characters or less").optional().or(z.literal("")),
  climate: z.string().max(100, "Climate must be 100 characters or less").optional().or(z.literal("")),
  population: z.string()
    .optional()
    .or(z.literal(""))
    .transform(val => val && val !== "" ? parseInt(val) : undefined)
    .refine(val => val === undefined || (Number.isInteger(val) && val >= 0), {
      message: "Population must be a positive number"
    }),
  notable_features: z.string().max(500, "Notable features must be 500 characters or less").optional().or(z.literal("")),
  connected_locations: z.string()
    .optional()
    .or(z.literal("")),
  tags: z.string().max(200, "Tags must be 200 characters or less").optional().or(z.literal("")),
})

export type LocationFormData = z.infer<typeof locationSchema>

// Transform function to convert form data for server action
export function transformLocationData(data: LocationFormData) {
  return {
    name: data.name,
    description: data.description,
    location_type: data.location_type || undefined,
    geography: data.geography || undefined,
    climate: data.climate || undefined,
    population: data.population || undefined,
    notable_features: data.notable_features || undefined,
    connected_locations: data.connected_locations ? 
      data.connected_locations.split(',').map(s => s.trim()).filter(Boolean) : 
      undefined,
    tags: data.tags || undefined,
  }
}