/**
 * Automated State Extraction for Character Responses
 *
 * This module analyzes LLM responses and extracts character state changes
 * using a crawl-walk-run approach:
 * - Crawl: Simple rule-based patterns
 * - Walk: Sophisticated parsing using existing parsers
 * - Run: ML/NLP techniques for complex detection
 */

import { parseCharacterUpdate, getFieldType } from "../../parsers/character-update-parser";
import { UnifiedParserResult } from "../../parsers/unified-parser";

export interface StateExtraction {
  fieldType: "appearance" | "personality" | "scents" | "location" | "emotion" | "action";
  originalText: string;
  extractedData: UnifiedParserResult | string;
  confidence: "low" | "medium" | "high";
  context: string;
}

export interface StateExtractionResult {
  extractions: StateExtraction[];
  metadata: {
    responseLength: number;
    extractionCount: number;
    highConfidenceCount: number;
    processingTime: number;
  };
}

/**
 * CRAWL: Simple rule-based pattern detection
 * Detects basic state changes like "hair is now blonde" or "feeling nervous"
 */
function extractSimplePatterns(text: string): StateExtraction[] {
  const extractions: StateExtraction[] = [];

  // Pattern 1: "X is now Y" - indicates state change
  const stateChangePattern =
    /(?:my|her|his|their)\s+(\w+)\s+(?:is|are|became?|turned?)\s+now\s+([^.!?;]+)/gi;
  const stateChangeMatches = Array.from(text.matchAll(stateChangePattern));

  stateChangeMatches.forEach((match) => {
    const bodyPart = match[1].toLowerCase();
    const description = match[2].trim();
    const fieldType = getFieldType(bodyPart);

    if (fieldType !== "other") {
      const updateText = `${bodyPart}: ${description}`;
      const parsed = parseCharacterUpdate(updateText, fieldType);

      if (parsed) {
        extractions.push({
          fieldType,
          originalText: match[0],
          extractedData: parsed.parsedData,
          confidence: "high",
          context: "direct_state_change",
        });
      }
    }
  });

  // Pattern 2: Feeling/emotion expressions
  const emotionPattern = /(?:I|she|he|they)\s+(?:feel|felt|am|is|was|became?)\s+([^.!?;,]+)/gi;
  const emotionMatches = Array.from(text.matchAll(emotionPattern));

  emotionMatches.forEach((match) => {
    const emotionText = match[1].trim();

    // Check if this is a personality/emotion change
    if (getFieldType(emotionText) === "personality") {
      const parsed = parseCharacterUpdate(`emotion: ${emotionText}`, "personality");

      if (parsed) {
        extractions.push({
          fieldType: "personality",
          originalText: match[0],
          extractedData: parsed.parsedData,
          confidence: "medium",
          context: "emotion_expression",
        });
      }
    }
  });

  // Pattern 3: Physical action descriptions with implications
  const actionPattern =
    /(?:\*.*?)(?:I|she|he|they)\s+(touched|ran|brushed|adjusted|moved|shifted)\s+(?:my|her|his|their)\s+(\w+)(?:.*?\*)?/gi;
  const actionMatches = Array.from(text.matchAll(actionPattern));

  actionMatches.forEach((match) => {
    const action = match[1];
    const bodyPart = match[2].toLowerCase();

    // Actions that might indicate appearance changes
    const appearanceActions = ["brushed", "adjusted", "styled", "fixed"];
    if (
      appearanceActions.includes(action.toLowerCase()) &&
      ["hair", "clothes", "makeup", "face"].includes(bodyPart)
    ) {
      extractions.push({
        fieldType: "action",
        originalText: match[0],
        extractedData: `${action} ${bodyPart}`,
        confidence: "low",
        context: "physical_action",
      });
    }
  });

  return extractions;
}

/**
 * WALK: Sophisticated parsing using sentence analysis
 * Analyzes sentence structure for more complex state changes
 */
function extractStructuredPatterns(text: string): StateExtraction[] {
  const extractions: StateExtraction[] = [];

  // Split into sentences for analysis
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 10);

  sentences.forEach((sentence) => {
    const trimmed = sentence.trim();

    // Look for descriptive sentences about character attributes
    const descriptivePattern =
      /(?:my|her|his|their)\s+(\w+)\s+(?:was|were|is|are|became?|looked?|seemed?|appeared?)\s+([^,;]+)/gi;
    const matches = Array.from(trimmed.matchAll(descriptivePattern));

    matches.forEach((match) => {
      const attribute = match[1].toLowerCase();
      const description = match[2].trim();
      const fieldType = getFieldType(`${attribute} ${description}`);

      if (fieldType !== "other") {
        const updateText = `${attribute}: ${description}`;
        const parsed = parseCharacterUpdate(updateText, fieldType);

        if (parsed) {
          extractions.push({
            fieldType,
            originalText: match[0],
            extractedData: parsed.parsedData,
            confidence: "medium",
            context: "descriptive_sentence",
          });
        }
      }
    });

    // Look for scent-related descriptions
    const scentPattern = /(?:smell|scent|aroma|fragrance)\s+(?:of|like)?\s*([^,;.!?]+)/gi;
    const scentMatches = Array.from(trimmed.matchAll(scentPattern));

    scentMatches.forEach((match) => {
      const scentDescription = match[1].trim();
      const parsed = parseCharacterUpdate(`scent: ${scentDescription}`, "scents");

      if (parsed) {
        extractions.push({
          fieldType: "scents",
          originalText: match[0],
          extractedData: parsed.parsedData,
          confidence: "medium",
          context: "scent_description",
        });
      }
    });
  });

  return extractions;
}

/**
 * RUN: Advanced pattern recognition (placeholder for future ML/NLP)
 * Currently implements basic contextual analysis
 */
function extractAdvancedPatterns(text: string): StateExtraction[] {
  const extractions: StateExtraction[] = [];

  // Future: This is where we could add:
  // - Sentiment analysis for personality changes
  // - Named entity recognition for location changes
  // - Contextual embedding analysis for subtle state changes
  // - ML models trained on character interaction patterns

  // For now, implement basic contextual clues
  const contextualClues = [
    {
      pattern: /(?:location|place|room|area).*?(?:changed?|moved?|went?|entered?)/gi,
      type: "location" as const,
    },
    {
      pattern: /(?:personality|character|nature).*?(?:changed?|shifted?|became?)/gi,
      type: "personality" as const,
    },
    {
      pattern: /(?:appearance|look|style).*?(?:changed?|different|new)/gi,
      type: "appearance" as const,
    },
  ];

  contextualClues.forEach(({ pattern, type }) => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach((match) => {
      extractions.push({
        fieldType: type,
        originalText: match[0],
        extractedData: match[0].trim(),
        confidence: "low",
        context: "contextual_clue",
      });
    });
  });

  return extractions;
}

/**
 * Main extraction function that combines all approaches
 */
export async function extractStateFromResponse(
  responseText: string,
  adventureId: string,
  options: {
    enableSimplePatterns?: boolean;
    enableStructuredPatterns?: boolean;
    enableAdvancedPatterns?: boolean;
    minConfidence?: "low" | "medium" | "high";
  } = {}
): Promise<StateExtractionResult> {
  const startTime = Date.now();

  const {
    enableSimplePatterns = true,
    enableStructuredPatterns = true,
    enableAdvancedPatterns = false, // Conservative default
    minConfidence = "low",
  } = options;

  let allExtractions: StateExtraction[] = [];

  // CRAWL: Simple patterns
  if (enableSimplePatterns) {
    const simpleExtractions = extractSimplePatterns(responseText);
    allExtractions = allExtractions.concat(simpleExtractions);
  }

  // WALK: Structured patterns
  if (enableStructuredPatterns) {
    const structuredExtractions = extractStructuredPatterns(responseText);
    allExtractions = allExtractions.concat(structuredExtractions);
  }

  // RUN: Advanced patterns
  if (enableAdvancedPatterns) {
    const advancedExtractions = extractAdvancedPatterns(responseText);
    allExtractions = allExtractions.concat(advancedExtractions);
  }

  // Filter by confidence level
  const confidenceLevels = { low: 1, medium: 2, high: 3 };
  const minLevel = confidenceLevels[minConfidence];
  const filteredExtractions = allExtractions.filter(
    (ext) => confidenceLevels[ext.confidence] >= minLevel
  );

  // Remove duplicates based on extracted data
  const uniqueExtractions = filteredExtractions.filter(
    (ext, index, arr) =>
      arr.findIndex(
        (other) => JSON.stringify(other.extractedData) === JSON.stringify(ext.extractedData)
      ) === index
  );

  const processingTime = Date.now() - startTime;
  const highConfidenceCount = uniqueExtractions.filter((ext) => ext.confidence === "high").length;

  return {
    extractions: uniqueExtractions,
    metadata: {
      responseLength: responseText.length,
      extractionCount: uniqueExtractions.length,
      highConfidenceCount,
      processingTime,
    },
  };
}

/**
 * Configuration for state extraction sensitivity
 */
export interface StateExtractionConfig {
  enabled: boolean;
  mode: "conservative" | "balanced" | "aggressive";
  minConfidence: "low" | "medium" | "high";
  enabledFeatures: {
    simplePatterns: boolean;
    structuredPatterns: boolean;
    advancedPatterns: boolean;
  };
}

export const DEFAULT_EXTRACTION_CONFIG: StateExtractionConfig = {
  enabled: true,
  mode: "conservative",
  minConfidence: "medium",
  enabledFeatures: {
    simplePatterns: true,
    structuredPatterns: true,
    advancedPatterns: false,
  },
};

/**
 * Get extraction configuration based on mode
 */
export function getExtractionConfig(
  mode: "conservative" | "balanced" | "aggressive"
): Partial<StateExtractionConfig["enabledFeatures"]> {
  switch (mode) {
    case "conservative":
      return {
        simplePatterns: true,
        structuredPatterns: false,
        advancedPatterns: false,
      };
    case "balanced":
      return {
        simplePatterns: true,
        structuredPatterns: true,
        advancedPatterns: false,
      };
    case "aggressive":
      return {
        simplePatterns: true,
        structuredPatterns: true,
        advancedPatterns: true,
      };
    default:
      return DEFAULT_EXTRACTION_CONFIG.enabledFeatures;
  }
}
