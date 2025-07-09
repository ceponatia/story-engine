// Response validation configuration for different adventure types

export interface ContextWindowConfig {
  default: number;
  min: number;
  max: number;
}

export interface ResponseValidationConfig {
  maxParagraphs: number;
  enforceAsteriskFormatting: boolean;
  preventUserSpeaking: boolean;
  addEndingMarker: boolean;
  maxTokens: number;
  stopSequences: string[];
  actionPatterns: string[];
  userPatterns: RegExp[];
  contextWindow: ContextWindowConfig;
}

export const RESPONSE_VALIDATION_CONFIGS: Record<string, ResponseValidationConfig> = {
  romance: {
    maxParagraphs: 2,
    enforceAsteriskFormatting: true,
    preventUserSpeaking: true,
    addEndingMarker: false, // Disabled: Using robust stop sequences instead
    maxTokens: 200,
    stopSequences: [
      "[USER:",
      "User:",
      "\nUser",
      "\n\n\n", // Stop on excessive newlines
    ],
    actionPatterns: [
      "walked",
      "ran",
      "looked",
      "felt",
      "thought",
      "moved",
      "stepped",
      "turned",
      "smiled",
      "laughed",
      "sighed",
      "breathed",
      "grabbed",
      "scanned",
      "raced",
      "paused",
      "hesitated",
      "nodded",
      "shook",
      "whispered",
      "blushed",
      "gasped",
      "trembled",
      "shivered",
      "melted",
      "leaned",
      "caressed",
      "touched",
    ],
    userPatterns: [
      /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
      /(\n|^)["\'].*?(you|user).*?["\'](\n|$)/gi,
      /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied|did|do|will|would|can|could|might|should)/gi,
      /(\n|^)\*?Your\s+(eyes|face|hands|voice|heart|mind|lips|skin|touch)/gi,
    ],
    contextWindow: {
      default: 18,
      min: 15,
      max: 20,
    },
  },

  action: {
    maxParagraphs: 2,
    enforceAsteriskFormatting: true,
    preventUserSpeaking: true,
    addEndingMarker: false, // Disabled: Using robust stop sequences instead
    maxTokens: 200,
    stopSequences: ["[USER:", "User:", "\nUser", "\n\n\n"],
    actionPatterns: [
      "walked",
      "ran",
      "looked",
      "felt",
      "thought",
      "moved",
      "stepped",
      "turned",
      "smiled",
      "laughed",
      "sighed",
      "breathed",
      "grabbed",
      "scanned",
      "raced",
      "paused",
      "hesitated",
      "nodded",
      "shook",
      "whispered",
      "shouted",
      "jumped",
      "ducked",
      "aimed",
      "fired",
      "blocked",
      "dodged",
      "struck",
      "hit",
      "rolled",
      "sprinted",
      "charged",
      "slashed",
      "parried",
      "crouched",
      "leaped",
    ],
    userPatterns: [
      /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
      /(\n|^)["\'].*?(you|user).*?["\'](\n|$)/gi,
      /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied|did|do|will|would|can|could|might|should)/gi,
      /(\n|^)\*?Your\s+(eyes|face|hands|voice|heart|mind|weapon|gear|equipment)/gi,
    ],
    contextWindow: {
      default: 10,
      min: 8,
      max: 12,
    },
  },

  general: {
    maxParagraphs: 3,
    enforceAsteriskFormatting: false,
    preventUserSpeaking: true,
    addEndingMarker: false,
    maxTokens: 300,
    stopSequences: ["[USER:", "User:", "\nUser"],
    actionPatterns: [],
    userPatterns: [
      /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
      /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied)/gi,
    ],
    contextWindow: {
      default: 10,
      min: 8,
      max: 15,
    },
  },
};

export function getValidationConfig(adventureType: string): ResponseValidationConfig {
  return RESPONSE_VALIDATION_CONFIGS[adventureType] || RESPONSE_VALIDATION_CONFIGS.general;
}

export async function getValidationConfigWithUser(
  adventureType: string,
  userId?: string
): Promise<ResponseValidationConfig> {
  // For user templates, get config from database
  if (userId) {
    const userConfig = await getUserValidationConfig(adventureType, userId);
    if (userConfig) return userConfig;
  }

  // Check public user templates
  const publicConfig = await getPublicValidationConfig(adventureType);
  if (publicConfig) return publicConfig;

  // Fall back to system configs
  return RESPONSE_VALIDATION_CONFIGS[adventureType] || RESPONSE_VALIDATION_CONFIGS.general;
}

async function getUserValidationConfig(
  adventureType: string,
  userId: string
): Promise<ResponseValidationConfig | null> {
  try {
    // Dynamic import to avoid circular dependencies
    const { userAdventureTypeRepository } = await import("@/lib/postgres/repositories");

    const userTemplate = await userAdventureTypeRepository.getByName(adventureType, userId);
    return (userTemplate?.validation_config as unknown as ResponseValidationConfig) || null;
  } catch (error) {
    console.warn(`Failed to get user validation config for ${adventureType}:`, error);
    return null;
  }
}

async function getPublicValidationConfig(
  adventureType: string
): Promise<ResponseValidationConfig | null> {
  try {
    // Dynamic import to avoid circular dependencies
    const { userAdventureTypeRepository } = await import("@/lib/postgres/repositories");

    const publicTemplate = await userAdventureTypeRepository.getPublicByName(adventureType);
    return (publicTemplate?.validation_config as unknown as ResponseValidationConfig) || null;
  } catch (error) {
    console.warn(`Failed to get public validation config for ${adventureType}:`, error);
    return null;
  }
}

export function getStopSequences(adventureType: string, characterName?: string): string[] {
  const config = getValidationConfig(adventureType);
  const stopSequences = [...config.stopSequences];

  if (characterName) {
    stopSequences.push(`${characterName}:`);
  }

  return stopSequences;
}

export function getContextWindowSize(adventureType: string, customSize?: number): number {
  const config = getValidationConfig(adventureType);

  // Use custom size if provided and within bounds
  if (customSize !== undefined) {
    return Math.max(config.contextWindow.min, Math.min(config.contextWindow.max, customSize));
  }

  // Use default for adventure type
  return config.contextWindow.default;
}
