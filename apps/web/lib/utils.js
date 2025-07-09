import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { parseTagsFromString, formatTagName } from "@story-engine/utils";
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export const hasDbConfig = process.env.DATABASE_URL;
export { formatTagName, parseTagsFromString };
