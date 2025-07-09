// Main entry point for the prompt system with MongoDB integration
// This file provides the public API and maintains backward compatibility

// Import and re-export from the original templates.ts file for backward compatibility
import * as originalTemplates from "./templates";
import { templateRegistry } from "./registry";
import { processTemplate } from "./utils/replacement";
import type { PromptContext, AdventureType } from "./types";

// Re-export all original exports for backward compatibility
export const SYSTEM_PROMPT_TEMPLATES = originalTemplates.SYSTEM_PROMPT_TEMPLATES;
export const ADVENTURE_TYPES = originalTemplates.ADVENTURE_TYPES;

// Enhanced buildSystemPrompt with MongoDB support
export async function buildSystemPrompt(context: PromptContext, userId?: string): Promise<string> {
  try {
    // Initialize registry if not already done
    await templateRegistry.initialize();

    // Try to get template from MongoDB/registry first
    const template = await templateRegistry.getTemplateWithContext(
      context.adventureType || "general",
      userId
    );

    if (template && template.content) {
      // Use the MongoDB/filesystem template
      return processTemplate(template.content, context);
    }

    // Fallback to original buildSystemPrompt for backward compatibility
    return originalTemplates.buildSystemPrompt(context);
  } catch (error) {
    console.warn("Failed to build system prompt with MongoDB, falling back to legacy:", error);

    // Fallback to original system
    return originalTemplates.buildSystemPrompt(context);
  }
}

// Export type definitions
export type { PromptContext, AdventureType };
