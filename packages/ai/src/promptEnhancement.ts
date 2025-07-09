/**
 * System Prompt Enhancement with Context-Aware Trait Data
 *
 * This module enhances LLM system prompts by injecting relevant character trait
 * information discovered through context analysis. It works in conjunction with
 * context-analyzer.ts and get-trait-info.ts to provide precise, contextual
 * character data to improve LLM response quality and consistency.
 */

import {
  analyzeConversationContext,
  getContextualCharacterInfo,
  ConversationContext,
  ContextAnalysisResult,
} from "./functions/context-analyzer";
import { get_multiple_traits, TraitInfoResponse } from "./functions/get_trait_info";

export interface TraitEnhancementResult {
  /** Whether trait enhancement was successful */
  success: boolean;
  /** The enhanced system prompt with trait data */
  enhancedPrompt: string;
  /** Original system prompt for comparison */
  originalPrompt: string;
  /** Details about the traits that were injected */
  traitsInjected: string[];
  /** Context analysis results */
  contextAnalysis: ContextAnalysisResult;
  /** Execution time for performance monitoring */
  executionTimeMs: number;
  /** Any errors encountered during enhancement */
  errors: string[];
}

/**
 * Format trait data into natural language for LLM consumption
 */
function formatTraitDataForPrompt(traitResponses: TraitInfoResponse[]): string {
  const traitDescriptions: string[] = [];

  for (const response of traitResponses) {
    if (response.success && response.data) {
      const { column, path, value, dataType } = response.data;

      // Skip null or undefined values
      if (value === null || value === undefined) {
        continue;
      }

      // Format based on column type and data structure
      let description = "";

      if (column === "appearance") {
        if (path?.includes("feet")) {
          description = formatAppearanceTrait("feet", path, value);
        } else if (path?.includes("hair")) {
          description = formatAppearanceTrait("hair", path, value);
        } else if (path?.includes("eyes")) {
          description = formatAppearanceTrait("eyes", path, value);
        } else if (path?.includes("body")) {
          description = formatAppearanceTrait("body", path, value);
        } else {
          description = formatGenericTrait("appearance", path, value);
        }
      } else if (column === "scents_aromas") {
        description = formatScentTrait(path, value);
      } else if (column === "personality") {
        description = formatPersonalityTrait(path, value);
      } else if (column === "background") {
        description = formatBackgroundTrait(path, value);
      } else {
        description = formatGenericTrait(column, path, value);
      }

      if (description) {
        traitDescriptions.push(description);
      }
    }
  }

  return traitDescriptions.join(" ");
}

/**
 * Format appearance-related traits
 */
function formatAppearanceTrait(bodyPart: string, path: string | undefined, value: unknown): string {
  const valueStr = formatValue(value);
  if (!valueStr) return "";

  if (bodyPart === "feet") {
    if (path?.includes("size")) {
      return `Your feet are ${valueStr}.`;
    } else if (path?.includes("appearance") || path?.includes("look")) {
      return `Your feet look ${valueStr}.`;
    } else {
      return `About your feet: ${valueStr}.`;
    }
  } else if (bodyPart === "hair") {
    if (path?.includes("color")) {
      return `Your hair is ${valueStr}.`;
    } else if (path?.includes("style")) {
      return `Your hair is styled ${valueStr}.`;
    } else {
      return `Your hair: ${valueStr}.`;
    }
  } else if (bodyPart === "eyes") {
    if (path?.includes("color")) {
      return `Your eyes are ${valueStr}.`;
    } else {
      return `Your eyes: ${valueStr}.`;
    }
  } else if (bodyPart === "body") {
    if (path?.includes("height")) {
      return `You are ${valueStr} tall.`;
    } else if (path?.includes("build")) {
      return `You have a ${valueStr} build.`;
    } else {
      return `Your body: ${valueStr}.`;
    }
  }

  return `Your ${bodyPart}: ${valueStr}.`;
}

/**
 * Format scent/aroma traits
 */
function formatScentTrait(path: string | undefined, value: unknown): string {
  const valueStr = formatValue(value);
  if (!valueStr) return "";

  if (path?.includes("feet")) {
    return `Your feet smell ${valueStr}.`;
  } else if (path?.includes("hair")) {
    return `Your hair smells like ${valueStr}.`;
  } else if (path?.includes("body")) {
    return `Your natural scent is ${valueStr}.`;
  } else {
    return `You smell like ${valueStr}.`;
  }
}

/**
 * Format personality traits
 */
function formatPersonalityTrait(path: string | undefined, value: unknown): string {
  const valueStr = formatValue(value);
  if (!valueStr) return "";

  if (path?.includes("traits")) {
    return `You are ${valueStr}.`;
  } else if (path?.includes("emotional_state")) {
    return `You are currently feeling ${valueStr}.`;
  } else if (path?.includes("behavioral_patterns")) {
    return `You typically ${valueStr}.`;
  } else {
    return `Your personality: ${valueStr}.`;
  }
}

/**
 * Format background information
 */
function formatBackgroundTrait(path: string | undefined, value: unknown): string {
  const valueStr = formatValue(value);
  if (!valueStr) return "";

  if (path?.includes("occupation")) {
    return `You work as ${valueStr}.`;
  } else {
    return `Your background: ${valueStr}.`;
  }
}

/**
 * Format generic traits
 */
function formatGenericTrait(column: string, path: string | undefined, value: unknown): string {
  const valueStr = formatValue(value);
  if (!valueStr) return "";

  const pathDesc = path ? ` (${path})` : "";
  return `${column}${pathDesc}: ${valueStr}.`;
}

/**
 * Convert various value types to readable strings
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const stringItems = value
      .filter((item) => item !== null && item !== undefined)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);

    if (stringItems.length === 0) return "";
    if (stringItems.length === 1) return stringItems[0];
    if (stringItems.length === 2) return `${stringItems[0]} and ${stringItems[1]}`;

    const lastItem = stringItems.pop();
    return `${stringItems.join(", ")}, and ${lastItem}`;
  }

  if (typeof value === "object") {
    // Handle object values by extracting meaningful information
    try {
      const obj = value as Record<string, unknown>;
      const descriptions: string[] = [];

      for (const [key, val] of Object.entries(obj)) {
        if (val !== null && val !== undefined) {
          const valStr = formatValue(val);
          if (valStr) {
            descriptions.push(`${key}: ${valStr}`);
          }
        }
      }

      return descriptions.join(", ");
    } catch {
      return String(value);
    }
  }

  return String(value);
}

/**
 * Enhance a system prompt with context-aware character trait data
 */
export async function enhanceSystemPromptWithTraits(
  originalPrompt: string,
  conversationContext: ConversationContext,
  options: {
    /** Maximum number of recent messages to analyze for context */
    lookbackMessages?: number;
    /** Minimum confidence threshold for trait queries */
    confidenceThreshold?: number;
    /** Whether to enable fallback to full character data */
    enableFallback?: boolean;
    /** Maximum execution time before timeout */
    timeoutMs?: number;
  } = {}
): Promise<TraitEnhancementResult> {
  const startTime = Date.now();
  const {
    lookbackMessages = 5,
    confidenceThreshold = 0.6,
    enableFallback = true,
    timeoutMs = 3000,
  } = options;

  const result: TraitEnhancementResult = {
    success: false,
    enhancedPrompt: originalPrompt,
    originalPrompt,
    traitsInjected: [],
    contextAnalysis: {
      queries: [],
      confidence: "low",
      fallbackToFullData: false,
      analysisLog: [],
    },
    executionTimeMs: 0,
    errors: [],
  };

  try {
    // Set up timeout for the entire operation
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Prompt enhancement timeout")), timeoutMs);
    });

    const enhancementPromise = async () => {
      // Step 1: Analyze conversation context to identify relevant traits
      const contextInfo = await getContextualCharacterInfo(conversationContext, {
        lookbackMessages,
        confidenceThreshold,
        enableEmbeddingSimilarity: false, // Disable for performance
      });

      result.contextAnalysis = contextInfo.analysis;

      // Step 2: Check if we found any relevant trait data
      if (!contextInfo.data || Object.keys(contextInfo.data).length === 0) {
        result.enhancedPrompt = originalPrompt;
        result.success = true;
        result.errors.push("No relevant trait data found for context");
        return;
      }

      // Step 3: Format trait data for natural language injection
      const traitDescriptions: string[] = [];

      for (const [key, value] of Object.entries(contextInfo.data)) {
        if (value !== null && value !== undefined) {
          // Convert database column.path format to readable description
          let description = "";

          if (key.includes("appearance.")) {
            const path = key.replace("appearance.", "");
            description = formatAppearanceTrait("", path, value);
          } else if (key.includes("scents_aromas.")) {
            const path = key.replace("scents_aromas.", "");
            description = formatScentTrait(path, value);
          } else if (key.includes("personality.")) {
            const path = key.replace("personality.", "");
            description = formatPersonalityTrait(path, value);
          } else if (key.includes("background")) {
            description = formatBackgroundTrait("", value);
          } else {
            description = formatGenericTrait(key, "", value);
          }

          if (description) {
            traitDescriptions.push(description);
            result.traitsInjected.push(key);
          }
        }
      }

      // Step 4: Inject trait information into system prompt
      if (traitDescriptions.length > 0) {
        const traitContext = traitDescriptions.join(" ");

        // Find a good insertion point in the prompt
        // Look for character description section or add at the end
        let enhancedPrompt = originalPrompt;

        // Check for common insertion points
        const insertionPatterns = [
          /(\n\n### Character Information:?\s*)/i,
          /(\n\n## Character:?\s*)/i,
          /(\n\nCharacter:?\s*)/i,
          /(\n\n### Context:?\s*)/i,
          /(\n\n## Context:?\s*)/i,
        ];

        let inserted = false;
        for (const pattern of insertionPatterns) {
          if (pattern.test(enhancedPrompt)) {
            enhancedPrompt = enhancedPrompt.replace(
              pattern,
              `$1\n**Relevant Character Details:** ${traitContext}\n\n`
            );
            inserted = true;
            break;
          }
        }

        // If no insertion point found, add at the end before any closing instructions
        if (!inserted) {
          const traitSection = `\n\n**Important Character Context:** ${traitContext}`;

          // Look for common ending patterns to insert before them
          const endingPatterns = [
            /(\n\n(?:Remember|Important|Note|Guidelines|Instructions):[\s\S]*$)/i,
            /(\n\n---\s*$)/,
            /(\n\n\*\*(?:Remember|Important|Note)[\s\S]*$)/i,
          ];

          let addedAtEnd = false;
          for (const pattern of endingPatterns) {
            if (pattern.test(enhancedPrompt)) {
              enhancedPrompt = enhancedPrompt.replace(pattern, `${traitSection}$1`);
              addedAtEnd = true;
              break;
            }
          }

          if (!addedAtEnd) {
            enhancedPrompt = `${enhancedPrompt}${traitSection}`;
          }
        }

        result.enhancedPrompt = enhancedPrompt;
      }

      result.success = true;
    };

    // Race between enhancement and timeout
    await Promise.race([enhancementPromise(), timeoutPromise]);
  } catch (error) {
    result.errors.push(
      error instanceof Error ? error.message : "Unknown error during prompt enhancement"
    );
    result.enhancedPrompt = originalPrompt; // Fallback to original
    result.success = false;
  }

  result.executionTimeMs = Date.now() - startTime;
  return result;
}

/**
 * Quick validation function to check if trait enhancement is beneficial
 * This can be used to skip enhancement for simple conversations
 */
export function shouldEnhancePrompt(userMessage: string, recentMessages: string[]): boolean {
  const combinedText = [userMessage, ...recentMessages.slice(-3)].join(" ").toLowerCase();

  // Keywords that suggest trait-specific information would be helpful
  const traitKeywords = [
    "feet",
    "foot",
    "hair",
    "eyes",
    "body",
    "smell",
    "scent",
    "look",
    "appearance",
    "personality",
    "feel",
    "emotion",
    "background",
    "past",
    "work",
    "job",
    "height",
    "build",
    "color",
    "style",
    "size",
    "aroma",
    "fragrance",
  ];

  return traitKeywords.some((keyword) => combinedText.includes(keyword));
}
