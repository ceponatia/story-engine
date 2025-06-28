// Main entry point for the prompt system
// This file provides the public API and maintains backward compatibility

// For now, maintain full backward compatibility by importing from the original file
// This ensures that existing imports like `await import('@/lib/prompts/templates')` continue to work

// Import and re-export from the original templates.ts file
const originalTemplates = require('./templates');

// Re-export all original exports for backward compatibility
export const buildSystemPrompt = originalTemplates.buildSystemPrompt;
export const SYSTEM_PROMPT_TEMPLATES = originalTemplates.SYSTEM_PROMPT_TEMPLATES;
export const ADVENTURE_TYPES = originalTemplates.ADVENTURE_TYPES;

// Export type definitions
export type { PromptContext, AdventureType } from './types';