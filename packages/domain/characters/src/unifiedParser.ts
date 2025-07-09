/**
 * Unified Parser for Character Attributes
 *
 * Converts natural language input like "hair: brown, long; feet: smelly, stinky"
 * Into structured JSONB: {"hair.appearance": ["brown", "long"], "feet.aroma": ["smelly", "stinky"]}
 *
 * All three attribute types (appearance, personality, scents_aromas) use this unified approach
 * for consistent LLM context retrieval.
 */

import { formatTagName } from "./utils";

export interface UnifiedParserResult {
  [key: string]: string[]; // "category.type": ["value1", "value2"]
}

export type AttributeType =
  | "appearance"
  | "personality"
  | "scents_aromas"
  | "location_features"
  | "setting_elements";

/**
 * Main unified parser function that handles all attribute types
 */
export function parseAttributeText(
  text: string,
  attributeType: AttributeType
): UnifiedParserResult {
  if (!text || text.trim() === "") {
    return {};
  }

  const result: UnifiedParserResult = {};

  // Strategy 1: Look for "Key: values" or "Key - values" pattern
  // Use a two-pass approach: find all key positions, then extract values between them
  const keyPositions: { start: number; end: number; key: string }[] = [];
  const keyPattern = /\b([a-z][a-z\s]*[a-z])\s*[:—-]/gi;
  let keyMatch;

  while ((keyMatch = keyPattern.exec(text)) !== null) {
    keyPositions.push({
      start: keyMatch.index,
      end: keyMatch.index + keyMatch[0].length,
      key: keyMatch[1].trim(),
    });
  }

  let matches: RegExpMatchArray[] = [];

  for (let i = 0; i < keyPositions.length; i++) {
    const currentKey = keyPositions[i];
    const nextKey = keyPositions[i + 1];

    const valueStart = currentKey.end;
    const valueEnd = nextKey ? nextKey.start : text.length;
    const valueText = text
      .slice(valueStart, valueEnd)
      .replace(/^\s*,?\s*/, "")
      .replace(/\s*,?\s*$/, "")
      .trim();

    if (valueText) {
      matches.push([
        `${currentKey.key}: ${valueText}`,
        currentKey.key,
        valueText,
      ] as RegExpMatchArray);
    }
  }

  if (matches.length > 0) {
    matches.forEach((match) => {
      const category = normalizeCategory(match[1]);
      const values = parseValues(match[2]);
      if (category && values.length > 0) {
        const namespacedKey = createNamespacedKey(category, values, attributeType);
        result[namespacedKey] = values;
      }
    });
    return result;
  }

  // Strategy 2: Look for parenthetical hints like "brown, long (hair)"
  const parentheticalPattern = /([^()]+)\s*\(([^)]+)\)/g;
  matches = Array.from(text.matchAll(parentheticalPattern));

  if (matches.length > 0) {
    matches.forEach((match) => {
      const values = parseValues(match[1]);
      const category = normalizeCategory(match[2]);
      if (category && values.length > 0) {
        const namespacedKey = createNamespacedKey(category, values, attributeType);
        result[namespacedKey] = values;
      }
    });
    return result;
  }

  // Strategy 3: Try to infer structure from context clues
  const inferredStructure = inferCategoryStructure(text, attributeType);
  if (Object.keys(inferredStructure).length > 0) {
    return inferredStructure;
  }

  // Strategy 4: Fallback - treat as general category
  const values = parseValues(text);
  if (values.length > 0) {
    const fallbackKey = getFallbackKey(attributeType);
    result[fallbackKey] = values;
  }

  return result;
}

/**
 * Normalizes category names to lowercase, removes articles, and formats consistently
 */
function normalizeCategory(category: string): string {
  let normalized = category
    .trim()
    .toLowerCase()
    .replace(/^(the|a|an)\s+/, "") // Remove articles
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/^_+|_+$/g, ""); // Trim underscores

  // Special handling: remove redundant suffixes for cleaner categories
  // Remove common suffixes like "size", "style", "color" that are better represented as sub-types
  normalized = normalized
    .replace(/_size$/, "")
    .replace(/_style$/, "")
    .replace(/_color$/, "")
    .replace(/_colour$/, "");

  // Normalize singular/plural forms for consistency
  const singularToPlural: { [key: string]: string } = {
    foot: "feet",
    hand: "hands",
    eye: "eyes",
    arm: "arms",
    leg: "legs",
    toe: "toes",
    finger: "fingers",
  };

  if (singularToPlural[normalized]) {
    normalized = singularToPlural[normalized];
  }

  // Ensure we don't end up with empty strings
  if (!normalized) {
    normalized = "general";
  }

  return normalized;
}

/**
 * Parses comma/semicolon separated values and normalizes them
 */
function parseValues(valueString: string): string[] {
  return valueString
    .split(/[,;]/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => {
      // Remove common descriptor words for scents
      return value.replace(/\b(scent|smell|aroma|fragrance|odor|perfume)\b/gi, "").trim();
    })
    .filter((value) => value.length > 0)
    .map((value) => formatTagName(value));
}

/**
 * Creates a namespaced key based on category and attribute type
 * E.g., "hair" + ["brown", "long"] + "appearance" → "hair.appearance"
 *       "feet" + ["smelly", "stinky"] + "scents_aromas" → "feet.aroma"
 */
function createNamespacedKey(
  category: string,
  values: string[],
  attributeType: AttributeType
): string {
  const subType = inferSubType(values, attributeType);
  return `${category}.${subType}`;
}

/**
 * Infers the sub-type based on the attribute type and descriptive values
 */
function inferSubType(values: string[], attributeType: AttributeType): string {
  const valueString = values.join(" ").toLowerCase();

  switch (attributeType) {
    case "appearance":
      return inferAppearanceSubType(valueString);
    case "personality":
      return inferPersonalitySubType(valueString);
    case "scents_aromas":
      return inferScentSubType(valueString);
    case "location_features":
      return inferLocationSubType(valueString);
    case "setting_elements":
      return inferSettingSubType(valueString);
    default:
      return "general";
  }
}

/**
 * Infers appearance sub-type from descriptive values
 */
function inferAppearanceSubType(valueString: string): string {
  // Color-related descriptors
  const colorWords = [
    "red",
    "blue",
    "green",
    "yellow",
    "black",
    "white",
    "brown",
    "blonde",
    "brunette",
    "gray",
    "grey",
    "pink",
    "purple",
    "orange",
    "silver",
    "golden",
    "dark",
    "light",
    "pale",
    "tan",
    "olive",
    "fair",
  ];
  if (colorWords.some((color) => valueString.includes(color))) {
    return "color";
  }

  // Length-related descriptors (especially for hair)
  const lengthWords = [
    "long",
    "short",
    "medium",
    "shoulder",
    "waist",
    "ankle",
    "floor",
    "chin",
    "ear",
    "neck",
    "length",
  ];
  if (lengthWords.some((length) => valueString.includes(length))) {
    return "length";
  }

  // Style-related descriptors (especially for hair)
  const styleWords = [
    "ponytail",
    "bob",
    "pixie",
    "bangs",
    "layers",
    "braids",
    "curls",
    "waves",
    "straight",
    "updo",
    "bun",
    "pigtails",
    "buzz",
    "crew",
    "fade",
  ];
  if (styleWords.some((style) => valueString.includes(style))) {
    return "style";
  }

  // Texture-related descriptors
  const textureWords = [
    "smooth",
    "rough",
    "soft",
    "hard",
    "silky",
    "coarse",
    "fine",
    "thick",
    "thin",
    "bumpy",
    "wrinkled",
    "glossy",
    "matte",
    "shiny",
    "dull",
    "curly",
    "wavy",
  ];
  if (textureWords.some((texture) => valueString.includes(texture))) {
    return "texture";
  }

  // Size-related descriptors
  const sizeWords = [
    "big",
    "small",
    "large",
    "tiny",
    "huge",
    "massive",
    "petite",
    "giant",
    "mini",
    "enormous",
    "tall",
    "wide",
    "narrow",
    "broad",
    "slim",
  ];
  if (sizeWords.some((size) => valueString.includes(size))) {
    return "size";
  }

  // Shape-related descriptors
  const shapeWords = [
    "round",
    "square",
    "oval",
    "circular",
    "angular",
    "curved",
    "pointed",
    "blunt",
    "sharp",
    "flat",
    "rounded",
  ];
  if (shapeWords.some((shape) => valueString.includes(shape))) {
    return "shape";
  }

  return "appearance";
}

/**
 * Infers personality sub-type from descriptive values
 */
function inferPersonalitySubType(valueString: string): string {
  // Emotional descriptors
  const emotionWords = [
    "happy",
    "sad",
    "angry",
    "excited",
    "nervous",
    "anxious",
    "calm",
    "peaceful",
    "joyful",
    "melancholy",
    "furious",
    "content",
    "worried",
    "relaxed",
    "stressed",
  ];
  if (emotionWords.some((emotion) => valueString.includes(emotion))) {
    return "emotions";
  }

  // Quirks/habits descriptors
  const quirkWords = [
    "twitches",
    "hums",
    "talks",
    "collects",
    "always",
    "never",
    "habit",
    "tends",
    "obsessed",
    "compulsive",
    "repetitive",
  ];
  if (quirkWords.some((quirk) => valueString.includes(quirk))) {
    return "quirks";
  }

  // Fear descriptors
  const fearWords = [
    "afraid",
    "scared",
    "terrified",
    "phobic",
    "fearful",
    "panicked",
    "frightened",
    "timid",
    "cowardly",
    "dreads",
  ];
  if (fearWords.some((fear) => valueString.includes(fear))) {
    return "fears";
  }

  // Desire descriptors
  const desireWords = [
    "wants",
    "wishes",
    "dreams",
    "hopes",
    "longs",
    "craves",
    "yearns",
    "desires",
    "seeks",
    "pursues",
    "ambitious",
  ];
  if (desireWords.some((desire) => valueString.includes(desire))) {
    return "desires";
  }

  // Motivation descriptors
  const motivationWords = [
    "driven",
    "motivated",
    "determined",
    "goal-oriented",
    "focused",
    "dedicated",
    "committed",
    "passionate",
    "inspired",
  ];
  if (motivationWords.some((motivation) => valueString.includes(motivation))) {
    return "motivations";
  }

  return "traits";
}

/**
 * Infers scent sub-type from descriptive values
 */
function inferScentSubType(valueString: string): string {
  // Pleasant/perfume-like descriptors
  const fragranceWords = [
    "floral",
    "sweet",
    "vanilla",
    "rose",
    "jasmine",
    "lavender",
    "citrus",
    "fresh",
    "clean",
    "perfumed",
    "pleasant",
    "lovely",
    "delicate",
    "subtle",
  ];
  if (fragranceWords.some((fragrance) => valueString.includes(fragrance))) {
    return "fragrance";
  }

  // Strong/distinctive scent descriptors
  const aromaWords = [
    "spicy",
    "warm",
    "rich",
    "deep",
    "intense",
    "strong",
    "distinctive",
    "exotic",
    "earthy",
    "woody",
    "herbal",
  ];
  if (aromaWords.some((aroma) => valueString.includes(aroma))) {
    return "aroma";
  }

  // Unpleasant/body odor descriptors
  const odorWords = [
    "sweaty",
    "musky",
    "sour",
    "tangy",
    "cheesy",
    "stinky",
    "funky",
    "ripe",
    "pungent",
    "acrid",
    "bitter",
    "sharp",
    "smelly",
  ];
  if (odorWords.some((odor) => valueString.includes(odor))) {
    return "scents";
  }

  return "aroma";
}

/**
 * Infers location sub-type from descriptive values
 */
function inferLocationSubType(valueString: string): string {
  // Physical structures and buildings
  const structureWords = [
    "building",
    "structure",
    "tower",
    "wall",
    "bridge",
    "gate",
    "door",
    "window",
    "roof",
    "floor",
    "stairs",
    "pillar",
    "column",
    "arch",
  ];
  if (structureWords.some((structure) => valueString.includes(structure))) {
    return "structures";
  }

  // Natural features
  const naturalWords = [
    "river",
    "mountain",
    "hill",
    "forest",
    "tree",
    "lake",
    "ocean",
    "valley",
    "cave",
    "rock",
    "stone",
    "grass",
    "flower",
    "plant",
    "garden",
  ];
  if (naturalWords.some((natural) => valueString.includes(natural))) {
    return "natural";
  }

  // Atmosphere and ambiance
  const atmosphereWords = [
    "dark",
    "bright",
    "quiet",
    "loud",
    "peaceful",
    "chaotic",
    "mysterious",
    "welcoming",
    "threatening",
    "ancient",
    "modern",
    "magical",
  ];
  if (atmosphereWords.some((atmosphere) => valueString.includes(atmosphere))) {
    return "atmosphere";
  }

  // Resources and materials
  const resourceWords = [
    "gold",
    "silver",
    "metal",
    "wood",
    "stone",
    "crystal",
    "gem",
    "water",
    "food",
    "treasure",
    "artifact",
    "weapon",
    "tool",
  ];
  if (resourceWords.some((resource) => valueString.includes(resource))) {
    return "resources";
  }

  return "features";
}

/**
 * Infers setting sub-type from descriptive values
 */
function inferSettingSubType(valueString: string): string {
  // World type and genre
  const genreWords = [
    "fantasy",
    "medieval",
    "modern",
    "futuristic",
    "sci-fi",
    "cyberpunk",
    "steampunk",
    "victorian",
    "ancient",
    "prehistoric",
    "magical",
    "technological",
  ];
  if (genreWords.some((genre) => valueString.includes(genre))) {
    return "genre";
  }

  // Political and social systems
  const politicalWords = [
    "kingdom",
    "empire",
    "republic",
    "democracy",
    "monarchy",
    "dictatorship",
    "guild",
    "clan",
    "tribe",
    "government",
    "ruler",
    "law",
  ];
  if (politicalWords.some((political) => valueString.includes(political))) {
    return "political";
  }

  // Cultural elements
  const culturalWords = [
    "tradition",
    "custom",
    "ritual",
    "ceremony",
    "festival",
    "religion",
    "belief",
    "language",
    "art",
    "music",
    "dance",
    "cuisine",
  ];
  if (culturalWords.some((cultural) => valueString.includes(cultural))) {
    return "cultural";
  }

  // Economic systems
  const economicWords = [
    "trade",
    "merchant",
    "market",
    "currency",
    "gold",
    "silver",
    "barter",
    "wealth",
    "poor",
    "rich",
    "resource",
    "mining",
    "farming",
  ];
  if (economicWords.some((economic) => valueString.includes(economic))) {
    return "economic";
  }

  // Historical events and lore
  const historyWords = [
    "war",
    "battle",
    "conflict",
    "peace",
    "alliance",
    "treaty",
    "legend",
    "myth",
    "prophecy",
    "ancient",
    "past",
    "history",
  ];
  if (historyWords.some((history) => valueString.includes(history))) {
    return "history";
  }

  return "elements";
}

/**
 * Attempts to infer category structure from unstructured text based on attribute type
 */
function inferCategoryStructure(text: string, attributeType: AttributeType): UnifiedParserResult {
  const result: UnifiedParserResult = {};

  const categoryMap = getCategoryMap(attributeType);
  const sentences = text.split(/[.!?;]/).filter((s) => s.trim());

  sentences.forEach((sentence) => {
    const lowerSentence = sentence.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryMap)) {
      const hasKeyword = keywords.some((keyword) => lowerSentence.includes(keyword));

      if (hasKeyword) {
        const descriptors = extractDescriptors(sentence, attributeType);
        if (descriptors.length > 0) {
          const namespacedKey = createNamespacedKey(category, descriptors, attributeType);
          if (!result[namespacedKey]) {
            result[namespacedKey] = [];
          }
          result[namespacedKey].push(...descriptors);
        }
      }
    }
  });

  // Remove duplicates
  Object.keys(result).forEach((key) => {
    result[key] = Array.from(new Set(result[key]));
  });

  return result;
}

/**
 * Gets the category mapping based on attribute type
 */
function getCategoryMap(attributeType: AttributeType): { [key: string]: string[] } {
  switch (attributeType) {
    case "appearance":
      return {
        body: ["body", "build", "frame", "physique", "figure", "torso", "trunk"],
        face: ["face", "facial", "visage", "countenance"],
        eyes: ["eyes", "eye", "gaze", "irises"],
        hair: ["hair", "locks", "mane", "tresses"],
        hairColor: ["hair color", "hair colour"],
        hairStyle: ["hair style", "hairstyle", "hair cut", "haircut"],
        skin: ["skin", "complexion", "flesh"],
        feet: ["feet", "foot", "toes"],
        hands: ["hands", "hand", "fingers", "palms"],
        legs: ["legs", "leg", "thighs", "calves"],
        arms: ["arms", "arm", "biceps", "forearms"],
        weight: ["weight", "body weight"],
        height: ["height", "stature"],
        breastSize: ["breast size", "chest size", "bust size"],
        feetSize: ["feet size", "foot size"],
      };

    case "personality":
      return {
        personality: ["personality", "character", "nature", "disposition", "temperament"],
      };

    case "scents_aromas":
      return {
        feet: ["feet", "foot", "toes", "soles"],
        hair: ["hair", "locks", "mane", "scalp"],
        body: ["body", "skin", "flesh"],
        breath: ["breath", "mouth", "lips"],
        armpits: ["armpits", "underarms", "pits"],
        hands: ["hands", "fingers", "palms"],
        neck: ["neck", "nape"],
        clothes: ["clothes", "clothing", "fabric", "shirt", "dress"],
      };

    default:
      return {};
  }
}

/**
 * Extracts descriptive words from a sentence based on attribute type
 */
function extractDescriptors(sentence: string, attributeType: AttributeType): string[] {
  const words = sentence
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);

  const skipWords = [
    "the",
    "and",
    "but",
    "with",
    "has",
    "have",
    "had",
    "was",
    "were",
    "is",
    "are",
    "very",
    "quite",
    "really",
    "rather",
    "somewhat",
    "appears",
    "seems",
    "looks",
  ];

  return words.filter((word) => !skipWords.includes(word)).map((word) => formatTagName(word));
}

/**
 * Gets the fallback key for when no specific category can be determined
 */
function getFallbackKey(attributeType: AttributeType): string {
  switch (attributeType) {
    case "appearance":
      return "general.appearance";
    case "personality":
      return "personality.traits";
    case "scents_aromas":
      return "general.scents";
    default:
      return "general.attribute";
  }
}

/**
 * Converts structured attribute data back to natural language for display
 */
export function attributeToText(attributeData: UnifiedParserResult): string {
  const parts: string[] = [];

  Object.entries(attributeData).forEach(([namespacedKey, values]) => {
    const [category, subType] = namespacedKey.split(".");
    const formattedCategory = formatTagName(category);
    const formattedSubType =
      subType === "appearance" || subType === "traits" || subType === "scents"
        ? ""
        : ` (${subType})`;
    const valuesList = values.join(", ");
    parts.push(`${formattedCategory}${formattedSubType}: ${valuesList}`);
  });

  return parts.join("; ");
}

/**
 * Merges two attribute objects, combining values for same keys
 */
export function mergeAttributes(
  existing: UnifiedParserResult,
  additional: UnifiedParserResult
): UnifiedParserResult {
  const result = { ...existing };

  Object.entries(additional).forEach(([key, values]) => {
    if (result[key]) {
      result[key] = Array.from(new Set([...result[key], ...values]));
    } else {
      result[key] = values;
    }
  });

  return result;
}

/**
 * Type aliases for backward compatibility
 */
export type ParsedAppearance = UnifiedParserResult;
export type ParsedPersonality = UnifiedParserResult;
export type ParsedScents = UnifiedParserResult;

/**
 * Convenience functions for specific attribute types
 */
export const parseAppearanceText = (text: string) => parseAttributeText(text, "appearance");
export const parsePersonalityText = (text: string) => parseAttributeText(text, "personality");
export const parseScentsText = (text: string) => parseAttributeText(text, "scents_aromas");

/**
 * Convenience functions to convert back to text (aliases for attributeToText)
 */
export const appearanceToText = (data: UnifiedParserResult) => attributeToText(data);
export const personalityToText = (data: UnifiedParserResult) => attributeToText(data);
export const scentsToText = (data: UnifiedParserResult) => attributeToText(data);
