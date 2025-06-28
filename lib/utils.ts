import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Database connection check
export const hasDbConfig = process.env.DATABASE_URL;

// Tag utility functions
export function formatTagName(tag: string): string {
  return tag.trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function parseTagsFromString(tagsString: string): string[] {
  if (!tagsString || tagsString.trim() === '') {
    return [];
  }
  
  return tagsString
    .split(',')
    .map(tag => formatTagName(tag))
    .filter(tag => tag.length > 0);
}
