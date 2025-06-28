import { z } from "zod"

// Constants from the original form
const WORLD_TYPE_OPTIONS = ["Fantasy", "Sci-Fi", "Modern", "Historical", "Post-Apocalyptic", "Cyberpunk", "Steampunk", "Other"] as const;

export const settingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(2000, "Description must be 2000 characters or less").optional().or(z.literal("")),
  world_type: z.enum(WORLD_TYPE_OPTIONS).optional().or(z.literal("")),
  history: z.string().max(2000, "History description must be 2000 characters or less").optional().or(z.literal("")),
  tags: z.string().max(200, "Tags must be 200 characters or less").optional().or(z.literal("")),
})

export type SettingFormData = z.infer<typeof settingSchema>

// Export the options for use in select components
export { WORLD_TYPE_OPTIONS }

// Transform function to convert form data for server action
export function transformSettingData(data: SettingFormData) {
  return {
    name: data.name,
    description: data.description || undefined,
    world_type: data.world_type || undefined,
    history: data.history || undefined,
    tags: data.tags || undefined,
  }
}