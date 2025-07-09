/**
 * Utility functions for character domain
 */

/**
 * Formats a tag name by capitalizing first letter of each word
 */
export function formatTagName(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}