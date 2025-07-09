"use server";

import { revalidatePath } from "next/cache";
import { adventureRepository, adventureCharacterRepository } from "@/lib/postgres/repositories";
import { parseCharacterUpdate, getFieldType } from "@/lib/parsers/character-update-parser";
import { requireAuth } from "@/lib/auth-helper";
import { attributeToText, UnifiedParserResult } from "@/lib/parsers/unified-parser";
import { RedisManager } from "@/lib/postgres/redis";

interface StateUpdate {
  field: string;
  value: unknown;
  timestamp: string;
  context?: string;
}

/**
 * Helper function to convert JSONB character data to natural language
 * Handles both character and adventure_character table data
 */
function convertCharacterDataToText(
  data: any,
  fieldType: "appearance" | "personality" | "scents"
): string {
  if (!data) return "";

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object") {
    try {
      // All three field types now use the unified attributeToText function
      return attributeToText(data as UnifiedParserResult);
    } catch (error) {
      console.error(`Error converting ${fieldType} data to text:`, error);
      return typeof data === "object" ? JSON.stringify(data) : String(data);
    }
  }

  return String(data);
}

// Helper functions moved to lib/parsers/character-update-parser.ts

/**
 * Enhanced updateCharacterState that can handle natural language input
 * and automatically convert it to structured JSONB
 */
export async function updateCharacterStateFromText(
  adventureId: string,
  textUpdates: Record<string, string>,
  context?: string
) {
  const structuredUpdates: Record<string, unknown> = {};

  // Parse each text update into structured data
  Object.entries(textUpdates).forEach(([field, text]) => {
    const fieldType = getFieldType(field);

    if (fieldType !== "other") {
      const parsed = parseCharacterUpdate(text, fieldType);
      if (parsed) {
        structuredUpdates[field] = parsed.parsedData;
      } else {
        // Fallback to raw text if parsing fails
        structuredUpdates[field] = text;
      }
    } else {
      structuredUpdates[field] = text;
    }
  });

  // Use the existing updateCharacterState function
  return await updateCharacterState(adventureId, structuredUpdates, context);
}

/**
 * Update character state with structured data (JSONB objects)
 * For natural language input, use updateCharacterStateFromText instead
 */
export async function updateCharacterState(
  adventureId: string,
  updates: Record<string, unknown>,
  context?: string
) {
  const { user } = await requireAuth();

  try {
    // Verify user owns this adventure
    const adventure = await adventureRepository.getById(adventureId, user.id);

    if (!adventure) {
      throw new Error("Adventure not found or not accessible");
    }

    // Get current character state
    const character = await adventureCharacterRepository.getByAdventure(adventureId, user.id);

    if (!character) {
      throw new Error("Adventure character not found");
    }

    // Prepare state updates with timestamps
    const timestamp = new Date().toISOString();
    const stateUpdates: Record<string, StateUpdate> = {};

    Object.entries(updates).forEach(([field, value]) => {
      stateUpdates[field] = {
        field,
        value,
        timestamp,
        context: context || `Updated during adventure`,
      };
    });

    // Merge with existing state_updates
    const currentStateUpdates = character || {};
    const newStateUpdates = {
      ...currentStateUpdates,
      ...stateUpdates,
    };

    // Update the character state in PostgreSQL database
    await adventureCharacterRepository.updateState(adventureId, newStateUpdates, user.id);

    // Phase 2: Generate embeddings for character trait changes (RAG integration)
    try {
      const { queueEmbeddingGeneration } = await import("@/lib/ai/embedding-service");

      // Generate embeddings for each updated field
      for (const [field, update] of Object.entries(stateUpdates)) {
        const fieldType = getFieldType(field);

        // Only generate embeddings for character-related fields
        if (fieldType !== "other" && update.value) {
          await queueEmbeddingGeneration({
            adventureCharacterId: character.id, // Use adventure_characters.id
            traitType: fieldType as "appearance" | "personality" | "scents_aromas",
            traitPath: field,
            traitValue: update.value,
            context: update.context,
          });
        }
      }
    } catch (embeddingError) {
      // Don't fail the character update if embedding generation fails
      console.warn("Failed to generate embeddings for character state update:", embeddingError);
    }

    // Invalidate cached character context since state has changed
    await RedisManager.invalidateCharacterContext(adventureId);
    console.debug(`Invalidated character context cache for: ${adventureId}`);

    revalidatePath(`/adventures/${adventureId}/chat`);
    return { success: true, updates: stateUpdates };
  } catch (error) {
    console.error("Error updating character state:", error);
    throw error;
  }
}

export async function getCharacterState(adventureId: string) {
  const { user } = await requireAuth();

  try {
    // Get character state from database
    const stateUpdates = await adventureCharacterRepository.getByAdventure(adventureId, user.id);

    // Build a character object with state updates
    const character = {
      name: "Adventure Character",
      personality: "Dynamic personality",
      background: "Adventure background",
      state_updates: stateUpdates,
      user_id: user.id,
      appearance: "Dynamic appearance",
      fragrances: "Dynamic scents",
    };

    return {
      success: true,
      character: {
        ...character,
        state_updates: character.state_updates || {},
      },
    };
  } catch (error) {
    console.error("Error getting character state:", error);
    throw error;
  }
}

export async function buildCharacterContext(adventureId: string): Promise<string> {
  try {
    // Try to get cached context first - this addresses the 200-500ms performance bottleneck
    const cachedContext = await RedisManager.getCachedCharacterContext(adventureId);
    if (cachedContext) {
      console.debug(`Cache hit for character context: ${adventureId}`);
      return cachedContext;
    }

    console.debug(`Cache miss for character context: ${adventureId}`);

    // Get the actual adventure character data from the database
    const character = await adventureCharacterRepository.getByAdventure(adventureId);
    if (!character) {
      return "";
    }

    // Get any state updates as well
    const { user } = await requireAuth();
    const stateUpdates = await adventureCharacterRepository.getByAdventure(adventureId, user.id);

    // Build enhanced context string with real character data
    let context = `You are ${character.name}, age ${character.age}.`;

    if (character.background) {
      context += ` Background: ${character.background}`;
    }

    // Add personality traits (convert JSONB to natural language)
    if (character.personality) {
      const personality = convertCharacterDataToText(character.personality, "personality");
      if (personality.trim()) {
        context += `\nPersonality: ${personality}`;
      }
    }

    // Add physical attributes (convert JSONB to natural language)
    if (character.appearance) {
      const physical = convertCharacterDataToText(character.appearance, "appearance");
      if (physical.trim()) {
        context += `\nPhysical attributes: ${physical}`;
      }
    }

    // Add scents/aromas (convert JSONB to natural language)
    if (character.scents_aromas) {
      const scents = convertCharacterDataToText(character.scents_aromas, "scents");
      if (scents.trim()) {
        context += `\nDistinctive scents: ${scents}`;
      }
    }

    // Add current state from updates if any (convert structured data to natural language)
    const currentState: string[] = [];
    if (stateUpdates) {
      Object.entries(stateUpdates.state_updates || {}).forEach(([key, update]) => {
        if (update && typeof update === "object" && "value" in update && update.value) {
          const fieldType = getFieldType(key);
          let formattedValue: string;

          // Convert structured state updates back to natural language based on field type
          if (fieldType === "other") {
            // For non-character fields, use simple string conversion
            formattedValue =
              typeof update.value === "object"
                ? JSON.stringify(update.value)
                : String(update.value);
          } else {
            // Use our helper function for character-related fields
            formattedValue = convertCharacterDataToText(update.value, fieldType);
          }

          // Only add non-empty state changes
          if (formattedValue.trim()) {
            currentState.push(`${key}: ${formattedValue}`);
          }
        }
      });
    }

    if (currentState.length > 0) {
      context += `\n\nCurrent state changes: ${currentState.join(", ")}`;
    }

    const finalContext = context.trim();

    // Cache the built context for 5 minutes (300 seconds)
    // This prevents the expensive convertCharacterDataToText() calls on subsequent requests
    await RedisManager.cacheCharacterContext(adventureId, finalContext, 300);
    console.debug(`Cached character context for: ${adventureId}`);

    return finalContext;
  } catch (error) {
    console.error("Error building character context:", error);
    return "";
  }
}
