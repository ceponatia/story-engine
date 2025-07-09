import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseTagsFromString, formatTagName } from "@story-engine/utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Database connection check
export const hasDbConfig = process.env.DATABASE_URL || "";

// Re-export tag utility functions from utils package
export { formatTagName, parseTagsFromString };
