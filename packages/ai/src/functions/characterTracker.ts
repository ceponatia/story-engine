/**
 * Character State Tracker for Automated Updates
 *
 * This module processes state extractions and applies them to character data
 * in the adventure_characters table, maintaining a history of changes.
 */

import { adventureCharacterRepository } from "@/lib/postgres/repositories";
import { StateExtraction, StateExtractionResult } from "./state-extractor";
import { UnifiedParserResult, mergeAttributes } from "../../parsers/unified-parser";

export interface StateUpdate {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  timestamp: string;
  context: string;
  confidence: "low" | "medium" | "high";
  source: "automated_extraction";
}

export interface CharacterStateEvent {
  eventType: "state_change" | "milestone" | "relationship_update" | "location_change";
  description: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface StateUpdateResult {
  success: boolean;
  updatesApplied: number;
  highConfidenceUpdates: number;
  events: CharacterStateEvent[];
  errors: string[];
}

/**
 * Convert state extractions to character state updates
 */
function processExtractions(extractions: StateExtraction[]): Record<string, StateUpdate> {
  const updates: Record<string, StateUpdate> = {};
  const timestamp = new Date().toISOString();

  extractions.forEach((extraction, index) => {
    const fieldKey = `auto_extracted_${extraction.fieldType}_${index}`;

    updates[fieldKey] = {
      field: fieldKey,
      oldValue: null, // Will be populated when we compare with existing state
      newValue: extraction.extractedData,
      timestamp,
      context: `Automated extraction: ${extraction.context} - "${extraction.originalText}"`,
      confidence: extraction.confidence,
      source: "automated_extraction",
    };
  });

  return updates;
}

/**
 * Merge new state updates with existing character state
 */
function mergeWithExistingState(
  existingState: Record<string, unknown>,
  newUpdates: Record<string, StateUpdate>
): Record<string, StateUpdate> {
  const mergedUpdates: Record<string, StateUpdate> = { ...newUpdates };

  // Check for conflicts with existing state and merge intelligently
  Object.entries(newUpdates).forEach(([key, update]) => {
    if (existingState[key]) {
      // Update the old value for tracking
      mergedUpdates[key] = {
        ...update,
        oldValue: existingState[key],
      };

      // If the new value is structured data (UnifiedParserResult), try to merge
      if (
        typeof update.newValue === "object" &&
        typeof existingState[key] === "object" &&
        update.newValue !== null &&
        existingState[key] !== null
      ) {
        try {
          const existingData = existingState[key] as UnifiedParserResult;
          const newData = update.newValue as UnifiedParserResult;
          const merged = mergeAttributes(existingData, newData);

          mergedUpdates[key] = {
            ...update,
            newValue: merged,
            context: `${update.context} (merged with existing data)`,
          };
        } catch (error) {
          console.warn("Failed to merge state data:", error);
          // Keep the new value as-is if merging fails
        }
      }
    }
  });

  return mergedUpdates;
}

/**
 * Generate character state events from updates
 */
function generateStateEvents(updates: Record<string, StateUpdate>): CharacterStateEvent[] {
  const events: CharacterStateEvent[] = [];
  const timestamp = new Date().toISOString();

  // Group updates by type for event generation
  const updatesByType: Record<string, StateUpdate[]> = {};
  Object.values(updates).forEach((update) => {
    const type = update.field.includes("appearance")
      ? "appearance"
      : update.field.includes("personality")
        ? "personality"
        : update.field.includes("scents")
          ? "scents"
          : "other";

    if (!updatesByType[type]) {
      updatesByType[type] = [];
    }
    updatesByType[type].push(update);
  });

  // Create events for significant changes
  Object.entries(updatesByType).forEach(([type, typeUpdates]) => {
    const highConfidenceUpdates = typeUpdates.filter((u) => u.confidence === "high");

    if (highConfidenceUpdates.length > 0) {
      const descriptions = highConfidenceUpdates.map(
        (u) => u.context.split(" - ")[1] || "Character change detected"
      );

      events.push({
        eventType: "state_change",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} changes detected: ${descriptions.join(", ")}`,
        timestamp,
        metadata: {
          type,
          updateCount: highConfidenceUpdates.length,
          confidence: "high",
          updates: highConfidenceUpdates.map((u) => ({
            field: u.field,
            newValue: u.newValue,
            context: u.context,
          })),
        },
      });
    }
  });

  return events;
}

/**
 * Main function to update character state from extractions
 */
export async function updateCharacterFromExtractions(
  adventureId: string,
  userId: string,
  extractionResult: StateExtractionResult,
  options: {
    minConfidence?: "low" | "medium" | "high";
    dryRun?: boolean;
    generateEvents?: boolean;
  } = {}
): Promise<StateUpdateResult> {
  const { minConfidence = "medium", dryRun = false, generateEvents = true } = options;

  const result: StateUpdateResult = {
    success: false,
    updatesApplied: 0,
    highConfidenceUpdates: 0,
    events: [],
    errors: [],
  };

  try {
    // Filter extractions by confidence
    const confidenceLevels = { low: 1, medium: 2, high: 3 };
    const minLevel = confidenceLevels[minConfidence];
    const validExtractions = extractionResult.extractions.filter(
      (ext) => confidenceLevels[ext.confidence] >= minLevel
    );

    if (validExtractions.length === 0) {
      result.success = true;
      return result;
    }

    // Get current character state
    const existingState = await adventureCharacterRepository.getState(adventureId, userId);

    // Process extractions into state updates
    const newUpdates = processExtractions(validExtractions);
    const mergedUpdates = mergeWithExistingState(existingState, newUpdates);

    // Generate events if requested
    if (generateEvents) {
      result.events = generateStateEvents(mergedUpdates);
    }

    // Count high confidence updates
    result.highConfidenceUpdates = Object.values(mergedUpdates).filter(
      (u) => u.confidence === "high"
    ).length;

    if (!dryRun && Object.keys(mergedUpdates).length > 0) {
      // Prepare the final state for database update
      const finalState = {
        ...existingState,
        ...Object.fromEntries(Object.entries(mergedUpdates).map(([key, update]) => [key, update])),
      };

      // Update character state in database
      await adventureCharacterRepository.updateState(adventureId, finalState, userId);
      result.updatesApplied = Object.keys(mergedUpdates).length;
    }

    result.success = true;
  } catch (error) {
    console.error("Error updating character from extractions:", error);
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  return result;
}

/**
 * Get character state history for analysis
 */
export async function getCharacterStateHistory(
  adventureId: string,
  userId: string,
  options: {
    includeAutomated?: boolean;
    includeManual?: boolean;
    since?: Date;
  } = {}
): Promise<StateUpdate[]> {
  const { includeAutomated = true, includeManual = true, since } = options;

  try {
    const stateData = await adventureCharacterRepository.getState(adventureId, userId);
    const history: StateUpdate[] = [];

    Object.entries(stateData).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null && "source" in value) {
        const update = value as StateUpdate;

        // Filter by source type
        if (
          (includeAutomated && update.source === "automated_extraction") ||
          (includeManual && update.source !== "automated_extraction")
        ) {
          // Filter by date if specified
          if (!since || new Date(update.timestamp) >= since) {
            history.push(update);
          }
        }
      }
    });

    // Sort by timestamp (newest first)
    return history.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error("Error getting character state history:", error);
    return [];
  }
}

/**
 * Analyze character development trends
 */
export function analyzeCharacterDevelopment(history: StateUpdate[]): {
  totalChanges: number;
  changesByType: Record<string, number>;
  confidenceDistribution: Record<string, number>;
  recentActivity: boolean;
  trends: string[];
} {
  const analysis = {
    totalChanges: history.length,
    changesByType: {} as Record<string, number>,
    confidenceDistribution: {} as Record<string, number>,
    recentActivity: false,
    trends: [] as string[],
  };

  // Analyze by type
  history.forEach((update) => {
    const type = update.field.includes("appearance")
      ? "appearance"
      : update.field.includes("personality")
        ? "personality"
        : update.field.includes("scents")
          ? "scents"
          : "other";

    analysis.changesByType[type] = (analysis.changesByType[type] || 0) + 1;
    analysis.confidenceDistribution[update.confidence] =
      (analysis.confidenceDistribution[update.confidence] || 0) + 1;
  });

  // Check for recent activity (last 24 hours)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  analysis.recentActivity = history.some((update) => new Date(update.timestamp) > oneDayAgo);

  // Generate trend insights
  const mostActiveType = Object.entries(analysis.changesByType).sort(([, a], [, b]) => b - a)[0];

  if (mostActiveType) {
    analysis.trends.push(
      `Most active change type: ${mostActiveType[0]} (${mostActiveType[1]} changes)`
    );
  }

  const highConfidenceCount = analysis.confidenceDistribution.high || 0;
  const highConfidencePercentage = (highConfidenceCount / analysis.totalChanges) * 100;

  if (highConfidencePercentage > 50) {
    analysis.trends.push(
      `High confidence in character changes (${highConfidencePercentage.toFixed(1)}%)`
    );
  }

  return analysis;
}
