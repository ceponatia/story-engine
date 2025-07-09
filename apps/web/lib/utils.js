import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export const hasDbConfig = process.env.DATABASE_URL;
export function formatTagName(tag) {
    return tag
        .trim()
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
export function parseTagsFromString(tagsString) {
    if (!tagsString || tagsString.trim() === "") {
        return [];
    }
    return tagsString
        .split(",")
        .map((tag) => formatTagName(tag))
        .filter((tag) => tag.length > 0);
}
