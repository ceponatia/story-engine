/**
 * AI Functions Integration
 *
 * Main entry point for automated AI functions including state extraction
 * and character tracking.
 */

export {
  extractStateFromResponse,
  DEFAULT_EXTRACTION_CONFIG,
  getExtractionConfig,
} from "./state-extractor";

export type {
  StateExtraction,
  StateExtractionResult,
  StateExtractionConfig,
} from "./state-extractor";

import type { StateExtractionResult } from "./state-extractor";
import type { StateUpdateResult } from "./character-tracker";

export {
  updateCharacterFromExtractions,
  getCharacterStateHistory,
  analyzeCharacterDevelopment,
} from "./character-tracker";

export type { StateUpdate, CharacterStateEvent, StateUpdateResult } from "./character-tracker";

export {
  analyzeConversationContext,
  getContextualCharacterInfo,
  executeAttributeQueries,
  ATTRIBUTE_SCHEMA,
} from "./context-analyzer";

export type {
  ConversationContext,
  AttributeQuery,
  ContextAnalysisResult,
} from "./context-analyzer";

export {
  get_trait_info,
  get_predefined_trait,
  get_multiple_traits,
  character_exists,
} from "./getTraitInfo";

export type {
  TraitKey,
  TraitInfoRequest,
  TraitInfoResponse,
  TraitInfoSuccess,
  TraitInfoError,
  ValidColumn,
} from "./getTraitInfo";

/**
 * Main integration function for LLM response processing
 * This is the primary function called from app/actions/llm.ts
 */
export async function processLLMResponse(
  responseText: string,
  adventureId: string,
  userId: string,
  options: {
    extractionMode?: "conservative" | "balanced" | "aggressive";
    minConfidence?: "low" | "medium" | "high";
    dryRun?: boolean;
    skipStateExtraction?: boolean;
  } = {}
): Promise<{
  stateExtraction?: StateExtractionResult;
  stateUpdate?: StateUpdateResult;
  success: boolean;
  errors: string[];
}> {
  const {
    extractionMode = "conservative",
    minConfidence = "medium",
    dryRun = false,
    skipStateExtraction = false,
  } = options;

  const result: {
    stateExtraction?: StateExtractionResult;
    stateUpdate?: StateUpdateResult;
    success: boolean;
    errors: string[];
  } = {
    success: false,
    errors: [] as string[],
  };

  try {
    if (skipStateExtraction) {
      result.success = true;
      return result;
    }

    // Import functions dynamically to avoid circular dependencies
    const { extractStateFromResponse, getExtractionConfig } = await import("./state-extractor");
    const { updateCharacterFromExtractions } = await import("./character-tracker");

    // Get extraction configuration for the mode
    const extractionConfig = getExtractionConfig(extractionMode);

    // Step 1: Extract state from LLM response
    const stateExtraction = await extractStateFromResponse(responseText, adventureId, {
      ...extractionConfig,
      minConfidence,
    });

    result.stateExtraction = stateExtraction;

    // Step 2: Update character state if extractions found
    if (stateExtraction.extractions.length > 0) {
      const stateUpdate = await updateCharacterFromExtractions(
        adventureId,
        userId,
        stateExtraction,
        {
          minConfidence,
          dryRun,
          generateEvents: true,
        }
      );

      result.stateUpdate = stateUpdate;

      if (!stateUpdate.success) {
        result.errors = result.errors.concat(stateUpdate.errors);
      }
    }

    result.success = true;
  } catch (error) {
    console.error("Error processing LLM response for state extraction:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  return result;
}

/**
 * Configuration for automated state processing
 */
export interface AutomatedStateConfig {
  enabled: boolean;
  extractionMode: "conservative" | "balanced" | "aggressive";
  minConfidence: "low" | "medium" | "high";
  enabledFor: {
    romance: boolean;
    action: boolean;
    general: boolean;
  };
}

export const DEFAULT_AUTOMATED_STATE_CONFIG: AutomatedStateConfig = {
  enabled: true,
  extractionMode: "conservative",
  minConfidence: "medium",
  enabledFor: {
    romance: true,
    action: false, // Disabled for action adventures by default (faster responses)
    general: true,
  },
};

/**
 * Get automated state configuration for an adventure type
 */
export function getAutomatedStateConfig(adventureType?: string): AutomatedStateConfig {
  const config = { ...DEFAULT_AUTOMATED_STATE_CONFIG };

  // Adventure-type-specific adjustments
  switch (adventureType) {
    case "romance":
      config.extractionMode = "balanced"; // More extraction for character development
      config.minConfidence = "medium";
      break;
    case "action":
      config.extractionMode = "conservative"; // Faster processing
      config.minConfidence = "high"; // Only high-confidence changes
      break;
    case "general":
      config.extractionMode = "conservative";
      config.minConfidence = "medium";
      break;
  }

  return config;
}
