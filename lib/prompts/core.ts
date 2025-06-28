// Core template processing engine

import type { PromptContext, AdventureType } from './types';
import { processTemplate } from './utils/replacement';
import { validateContext } from './utils/validation';

// Template cache for performance optimization
const templateCache = new Map<string, string>();

/**
 * Build system prompt from template and context
 * This is the main entry point for template processing
 */
export function buildSystemPrompt(
  adventureType: AdventureType,
  context: PromptContext
): string {
  // Validate context
  validateContext(context);
  
  // Check cache first
  const cacheKey = `${adventureType}-${JSON.stringify(context)}`;
  if (templateCache.has(cacheKey)) {
    return templateCache.get(cacheKey)!;
  }

  // Get template content using the new modular system with legacy fallback
  let template: string;
  
  try {
    // Try to get template from the registry first
    const { templateRegistry } = await import('./registry');
    await templateRegistry.initialize();
    
    const templateObj = templateRegistry.getTemplate(adventureType);
    if (templateObj) {
      template = templateObj.content;
    } else {
      // Fallback to optimized templates
      const { SYSTEM_PROMPT_TEMPLATES } = await import('./templates/index');
      template = SYSTEM_PROMPT_TEMPLATES[adventureType];
    }
  } catch (error) {
    // Final fallback to original legacy system
    try {
      const originalTemplates = require('./templates');
      template = originalTemplates.SYSTEM_PROMPT_TEMPLATES[adventureType];
    } catch (legacyError) {
      throw new Error(`Failed to load templates: ${error}, legacy fallback: ${legacyError}`);
    }
  }
  
  if (!template) {
    throw new Error(`Unknown adventure type: ${adventureType}`);
  }

  // Process template with context
  const prompt = processTemplate(template, context);
  
  // Cache the result
  templateCache.set(cacheKey, prompt);
  
  return prompt;
}

/**
 * Clear template cache - useful for development and testing
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: templateCache.size,
    keys: Array.from(templateCache.keys())
  };
}