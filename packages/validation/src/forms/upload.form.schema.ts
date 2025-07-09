import { z } from "zod";

// Allowed file types for uploads
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"] as const;
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "text/plain",
  "application/json",
] as const;

// Maximum file sizes (in bytes)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Schema for file upload validation
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is required")
    .refine((file) => file.size <= MAX_IMAGE_SIZE, "File size must be less than 5MB")
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
      "File type must be JPEG, PNG, or WebP"
    ),
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be 255 characters or less")
    .regex(/^[a-zA-Z0-9._-]+$/, "Filename contains invalid characters"),
});

// Schema for avatar upload specifically
export const avatarUploadSchema = fileUploadSchema.extend({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Avatar file is required")
    .refine((file) => file.size <= MAX_IMAGE_SIZE, "Avatar file size must be less than 5MB")
    .refine(
      (file) => ALLOWED_IMAGE_TYPES.includes(file.type as any),
      "Avatar must be JPEG, PNG, or WebP format"
    ),
});

// Schema for document upload
export const documentUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, "Document file is required")
    .refine((file) => file.size <= MAX_DOCUMENT_SIZE, "Document file size must be less than 10MB")
    .refine(
      (file) => ALLOWED_DOCUMENT_TYPES.includes(file.type as any),
      "Document must be PDF, text, or JSON format"
    ),
  filename: z
    .string()
    .min(1, "Filename is required")
    .max(255, "Filename must be 255 characters or less")
    .regex(/^[a-zA-Z0-9._-]+$/, "Filename contains invalid characters"),
});

// Schema for form data validation (multipart/form-data)
export const uploadFormDataSchema = z.object({
  file: z.string().min(1, "File is required"), // FormData file as string
  filename: z
    .string()
    .optional()
    .transform((val) => val || "upload"),
  category: z.enum(["avatar", "document", "image"]).optional().default("image"),
});

// Export types for TypeScript
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type UploadFormDataInput = z.infer<typeof uploadFormDataSchema>;
