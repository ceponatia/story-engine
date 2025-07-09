/**
 * Context-Aware Character Data Retrieval System
 *
 * Analyzes conversation context to determine which specific character attributes
 * to retrieve from the database, enabling precise and efficient character data access
 * for LLM responses while maintaining character consistency.
 *
 * Based on consensus analysis from Gemini-2.5-Pro and O3 models.
 */

import { adventureCharacterRepository } from "@/lib/postgres/repositories";
import {
  COMPREHENSIVE_ATTRIBUTE_SCHEMA,
  SCHEMA_VERSION,
  type AttributeKey,
} from "../schema/attribute.schema";

// Re-export the comprehensive schema as ATTRIBUTE_SCHEMA for backward compatibility
export const ATTRIBUTE_SCHEMA = COMPREHENSIVE_ATTRIBUTE_SCHEMA;

export interface ConversationContext {
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
  activeAdventureCharacterId?: string; // This is adventure_characters.id
  adventureId: string; // This is adventures.id
  adventureType?: string; // Optional: 'romance', 'action', 'general' for context-aware analysis
}

export interface AttributeQuery {
  adventureCharacterId: string;
  column: string;
  path?: string;
  confidence: number;
  matchedKeywords: string[];
  queryReason: string;
}

export interface ContextAnalysisResult {
  queries: AttributeQuery[];
  activeCharacter?: string;
  confidence: "low" | "medium" | "high";
  fallbackToFullData: boolean;
  analysisLog: string[];
}

/**
 * Analyze conversation context to determine which character attributes to retrieve
 */
export async function analyzeConversationContext(
  context: ConversationContext,
  options: {
    lookbackMessages?: number;
    confidenceThreshold?: number;
    enableEmbeddingSimilarity?: boolean;
  } = {}
): Promise<ContextAnalysisResult> {
  const {
    lookbackMessages = 5,
    confidenceThreshold = 0.6,
    enableEmbeddingSimilarity = false,
  } = options;

  const result: ContextAnalysisResult = {
    queries: [],
    confidence: "low",
    fallbackToFullData: false,
    analysisLog: [],
  };

  try {
    // Get recent conversation messages for analysis
    const recentMessages = context.messages.slice(-lookbackMessages);
    const conversationText = recentMessages
      .map((msg) => msg.content)
      .join(" ")
      .toLowerCase();

    result.analysisLog.push(`Analyzing ${recentMessages.length} recent messages`);

    // Extract character references and determine active character
    const characterId = await resolveActiveCharacter(context, conversationText);
    if (!characterId) {
      result.fallbackToFullData = true;
      result.analysisLog.push("No active character identified, falling back to full data");
      return result;
    }

    result.activeCharacter = characterId;
    result.analysisLog.push(`Active character resolved: ${characterId}`);

    // Perform keyword-based attribute mapping
    const keywordMatches = performKeywordMatching(conversationText);
    result.analysisLog.push(`Found ${keywordMatches.length} keyword matches`);

    // Convert matches to queries
    for (const match of keywordMatches) {
      if (match.confidence >= confidenceThreshold) {
        result.queries.push({
          adventureCharacterId: characterId,
          column: match.column,
          path: match.path,
          confidence: match.confidence,
          matchedKeywords: match.keywords,
          queryReason: `Keyword match: ${match.keywords.join(", ")}`,
        });
      }
    }

    // Determine overall confidence
    if (result.queries.length === 0) {
      result.confidence = "low";
      result.fallbackToFullData = true;
      result.analysisLog.push("No high-confidence matches, falling back to full data");
    } else if (result.queries.some((q) => q.confidence > 0.8)) {
      result.confidence = "high";
    } else {
      result.confidence = "medium";
    }

    result.analysisLog.push(`Analysis complete with ${result.confidence} confidence`);
    return result;
  } catch (error) {
    console.error("Error analyzing conversation context:", error);
    result.fallbackToFullData = true;
    result.analysisLog.push(
      `Error occurred: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return result;
  }
}

/**
 * Resolve which adventure character is currently active in the conversation
 */
async function resolveActiveCharacter(
  context: ConversationContext,
  conversationText: string
): Promise<string | null> {
  // If we have an explicit active adventure character, use it
  if (context.activeAdventureCharacterId) {
    return context.activeAdventureCharacterId;
  }

  // Try to extract character references from recent messages
  // This is a simplified implementation - could be enhanced with NER
  const characterNamePatterns = [
    /(?:character|she|he|they|her|him|them)\s+(?:is|was|has|had)/gi,
    /(?:the|my|your)\s+character/gi,
  ];

  for (const pattern of characterNamePatterns) {
    if (pattern.test(conversationText)) {
      // For now, return the adventure's primary character
      // This could be enhanced to maintain character focus state
      try {
        // Import the queries function to get adventure character
        const adventureCharacter = await adventureCharacterRepository.getByAdventure(
          context.adventureId
        );
        if (adventureCharacter) {
          // Return the adventure character's ID (adventure_characters.id)
          return adventureCharacter.id;
        }
      } catch (error) {
        console.warn("Failed to get adventure characters:", error);
      }
      break;
    }
  }

  return null;
}

/**
 * Perform keyword-based matching against the attribute schema
 */
function performKeywordMatching(text: string): Array<{
  column: string;
  path: string;
  confidence: number;
  keywords: string[];
}> {
  const matches: Array<{
    column: string;
    path: string;
    confidence: number;
    keywords: string[];
  }> = [];

  for (const [attributeKey, schema] of Object.entries(ATTRIBUTE_SCHEMA)) {
    const foundKeywords: string[] = [];
    let totalMatches = 0;

    // Check for direct keyword matches
    for (const keyword of schema.keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const keywordMatches = text.match(regex);
      if (keywordMatches) {
        foundKeywords.push(keyword);
        totalMatches += keywordMatches.length;
      }
    }

    // Check for alias matches
    for (const alias of schema.aliases) {
      const regex = new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`, "gi");
      if (regex.test(text)) {
        foundKeywords.push(alias);
        totalMatches += 1;
      }
    }

    if (foundKeywords.length > 0) {
      // Calculate confidence based on number of matches and keyword specificity
      const baseConfidence = Math.min(foundKeywords.length / schema.keywords.length, 1);
      const matchBonus = Math.min(totalMatches * 0.1, 0.3);
      const confidence = Math.min(baseConfidence + matchBonus, 0.95);

      matches.push({
        column: schema.column,
        path: schema.path,
        confidence,
        keywords: foundKeywords,
      });
    }
  }

  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Execute attribute queries and return formatted character data
 */
export async function executeAttributeQueries(
  queries: AttributeQuery[]
): Promise<Record<string, unknown>> {
  const results: Record<string, unknown> = {};

  for (const query of queries) {
    try {
      // Get the specific adventure character by ID
      const db = (await import("../../postgres/pool")).default();
      const result = await db.query("SELECT * FROM adventure_characters WHERE id = $1", [
        query.adventureCharacterId,
      ]);

      if (result.rows.length > 0) {
        const character = result.rows[0];
        const columnData = character[query.column as keyof typeof character];

        if (query.path && typeof columnData === "object" && columnData) {
          // Extract specific JSONB path
          const pathParts = query.path.split(".");
          let value = columnData as any;

          for (const part of pathParts) {
            if (value && typeof value === "object" && part in value) {
              value = value[part];
            } else {
              value = null;
              break;
            }
          }

          if (value !== null) {
            results[`${query.column}.${query.path}`] = value;
          }
        } else {
          // Return entire column
          results[query.column] = columnData;
        }
      }
    } catch (error) {
      console.error(`Failed to execute query for ${query.column}:${query.path}:`, error);
    }
  }

  return results;
}

/**
 * Main function to get context-aware character info
 */
export async function getContextualCharacterInfo(
  context: ConversationContext,
  options?: {
    lookbackMessages?: number;
    confidenceThreshold?: number;
    enableEmbeddingSimilarity?: boolean;
  }
): Promise<{
  data: Record<string, unknown>;
  analysis: ContextAnalysisResult;
}> {
  const analysis = await analyzeConversationContext(context, options);

  let data: Record<string, unknown> = {};

  if (analysis.fallbackToFullData && analysis.activeCharacter) {
    // Return all character data as fallback
    try {
      const characterData = await adventureCharacterRepository.getByAdventure(context.adventureId);
      if (characterData) {
        data = characterData as unknown as Record<string, unknown>;
      }
    } catch (error) {
      console.error("Failed to get full character data:", error);
    }
  } else if (analysis.queries.length > 0) {
    // Execute specific attribute queries
    data = await executeAttributeQueries(analysis.queries);
  }

  return { data, analysis };
}
