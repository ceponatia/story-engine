export function formatTagName(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function parseTagsFromString(tagsString: string): string[] {
  if (!tagsString || tagsString.trim() === "") {
    return [];
  }

  return tagsString
    .split(",")
    .map((tag) => formatTagName(tag))
    .filter((tag) => tag.length > 0);
}
