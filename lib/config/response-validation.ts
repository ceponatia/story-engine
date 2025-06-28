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
    addEndingMarker: true,
    maxTokens: 200,
    stopSequences: [
      '[USER:',
      'User:',
      '\nUser',
      '\n\n\n' // Stop on excessive newlines
    ],
    actionPatterns: [
      'walked', 'ran', 'looked', 'felt', 'thought', 'moved', 'stepped', 'turned',
      'smiled', 'laughed', 'sighed', 'breathed', 'grabbed', 'scanned', 'raced',
      'paused', 'hesitated', 'nodded', 'shook', 'whispered', 'blushed', 'gasped',
      'trembled', 'shivered', 'melted', 'leaned', 'caressed', 'touched'
    ],
    userPatterns: [
      /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
      /(\n|^)["\'].*?(you|user).*?["\'](\n|$)/gi,
      /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied|did|do|will|would|can|could|might|should)/gi,
      /(\n|^)\*?Your\s+(eyes|face|hands|voice|heart|mind|lips|skin|touch)/gi
    ],
    contextWindow: {
      default: 18,
      min: 15,
      max: 20
    }
  },
  
  action: {
    maxParagraphs: 2,
    enforceAsteriskFormatting: true,
    preventUserSpeaking: true,
    addEndingMarker: true,
    maxTokens: 200,
    stopSequences: [
      '[USER:',
      'User:',
      '\nUser',
      '\n\n\n'
    ],
    actionPatterns: [
      'walked', 'ran', 'looked', 'felt', 'thought', 'moved', 'stepped', 'turned',
      'smiled', 'laughed', 'sighed', 'breathed', 'grabbed', 'scanned', 'raced',
      'paused', 'hesitated', 'nodded', 'shook', 'whispered', 'shouted', 'jumped',
      'ducked', 'aimed', 'fired', 'blocked', 'dodged', 'struck', 'hit', 'rolled',
      'sprinted', 'charged', 'slashed', 'parried', 'crouched', 'leaped'
    ],
    userPatterns: [
      /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
      /(\n|^)["\'].*?(you|user).*?["\'](\n|$)/gi,
      /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied|did|do|will|would|can|could|might|should)/gi,
      /(\n|^)\*?Your\s+(eyes|face|hands|voice|heart|mind|weapon|gear|equipment)/gi
    ],
    contextWindow: {
      default: 10,
      min: 8,
      max: 12
    }
  },

  general: {
    maxParagraphs: 3,
    enforceAsteriskFormatting: false,
    preventUserSpeaking: true,
    addEndingMarker: false,
    maxTokens: 300,
    stopSequences: [
      '[USER:',
      'User:',
      '\nUser'
    ],
    actionPatterns: [],
    userPatterns: [
      /(\n|^)(You|User|The user)[\s\w]*?[.!?](\n|$)/gi,
      /(\n|^)\*?You\s+(say|said|ask|asked|respond|responded|reply|replied)/gi
    ],
    contextWindow: {
      default: 10,
      min: 8,
      max: 15
    }
  }
};

export function getValidationConfig(adventureType: string): ResponseValidationConfig {
  return RESPONSE_VALIDATION_CONFIGS[adventureType] || RESPONSE_VALIDATION_CONFIGS.general;
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