// packages/ai/src/character.search.ts

/**
 * AI-specific character search functionality.
 * Integrates with embedding services and character repositories to provide
 * semantic search capabilities for character traits and conversation memory.
 */

import { findSimilarTraits } from "./embedding-service";
import { adventureCharacterRepository, getAdventureMessages } from "@/lib/postgres/repositories";
import { DEFAULT_EMBEDDING_MODEL, EMBEDDING_CONFIG } from "./config/embeddings";
import type { SearchResult, ConversationMessage } from "../../types/search";
import {
  searchConversationMessages,
  conversationMatchesToSearchResults,
  CONVERSATION_DEFAULTS,
} from "../../utils/search/conversation.parser";
import { SIMILARITY_THRESHOLDS } from "../../utils/search/similarity.parser";

export interface CharacterSearchContext {
  adventureId: string;
  adventureCharacterId?: string;
  conversationHistory?: Array<{ role: string; content: string }>;
  searchQuery: string;
  searchType: "character_traits" | "conversation_memory" | "general";
}

export interface CharacterSearchResponse {
  results: SearchResult[];
  totalFound: number;
  searchMetadata: {
    query: string;
    searchType: string;
    processingTime: number;
    embeddingModel: string;
  };
}

/**
 * Perform semantic search for character-related information
 */
export async function performSimilaritySearch(
  context: CharacterSearchContext,
  options: {
    maxResults?: number;
    similarityThreshold?: number;
    includeConversationHistory?: boolean;
  } = {}
): Promise<CharacterSearchResponse> {
  const startTime = Date.now();
  const {
    maxResults = 10,
    similarityThreshold = EMBEDDING_CONFIG.SIMILARITY_THRESHOLD,
    includeConversationHistory = true,
  } = options;

  const results: SearchResult[] = [];

  try {
    // Get adventure character if not provided
    let characterId = context.adventureCharacterId;
    if (!characterId) {
      const adventureCharacter = await adventureCharacterRepository.getByAdventure(
        context.adventureId
      );
      characterId = adventureCharacter?.id;
    }

    if (!characterId) {
      throw new Error("No adventure character found for similarity search");
    }

    // Search character traits using embedding service
    if (context.searchType === "character_traits" || context.searchType === "general") {
      const traitResults = await searchCharacterTraits(context.searchQuery, characterId, {
        limit: maxResults,
        similarityThreshold,
      });
      results.push(...traitResults);
    }

    // Search conversation history using new conversation parser
    if (
      includeConversationHistory &&
      (context.searchType === "conversation_memory" || context.searchType === "general")
    ) {
      const conversationResults = await searchConversationMemory(
        context.searchQuery,
        context.adventureId,
        { limit: maxResults, similarityThreshold }
      );
      results.push(...conversationResults);
    }

    // Sort by relevance score and limit results
    const sortedResults = results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);

    const processingTime = Date.now() - startTime;

    return {
      results: sortedResults,
      totalFound: results.length,
      searchMetadata: {
        query: context.searchQuery,
        searchType: context.searchType,
        processingTime,
        embeddingModel: DEFAULT_EMBEDDING_MODEL,
      },
    };
  } catch (error) {
    console.error("Similarity search failed:", error);

    const processingTime = Date.now() - startTime;

    return {
      results: [],
      totalFound: 0,
      searchMetadata: {
        query: context.searchQuery,
        searchType: context.searchType,
        processingTime,
        embeddingModel: DEFAULT_EMBEDDING_MODEL,
      },
    };
  }
}

/**
 * Search for similar character traits using embeddings
 */
async function searchCharacterTraits(
  query: string,
  adventureCharacterId: string,
  options: { limit: number; similarityThreshold: number }
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  try {
    const traitMatches = await findSimilarTraits(query, adventureCharacterId, {
      limit: options.limit,
      similarityThreshold: options.similarityThreshold,
    });

    for (const match of traitMatches) {
      results.push({
        type: "character_trait",
        content: `${match.trait_path}: [Character trait with ${(match.similarity_score * 100).toFixed(1)}% similarity]`,
        relevanceScore: match.similarity_score,
        metadata: {
          source: "character_traits",
          traitPath: match.trait_path,
          timestamp: match.metadata.created_at,
        },
      });
    }
  } catch (error) {
    console.error("Character trait search failed:", error);
  }

  return results;
}

/**
 * Search conversation memory using the new conversation parser
 */
async function searchConversationMemory(
  query: string,
  adventureId: string,
  options: { limit: number; similarityThreshold: number }
): Promise<SearchResult[]> {
  try {
    // Get recent messages from the database
    const recentMessages = await getAdventureMessages(
      adventureId,
      CONVERSATION_DEFAULTS.RECENT_MESSAGE_LIMIT
    );

    // Convert to the expected format
    const conversationMessages: ConversationMessage[] = recentMessages.map((msg) => ({
      id: msg.id,
      content: msg.content,
      role: msg.role,
      created_at: msg.created_at,
      metadata: {},
    }));

    // Use the new conversation parser
    const matches = searchConversationMessages(query, conversationMessages, {
      maxResults: options.limit,
      threshold: options.similarityThreshold,
    });

    // Convert matches to search results
    return conversationMatchesToSearchResults(matches, {
      contentTruncateLength: CONVERSATION_DEFAULTS.CONTENT_TRUNCATE_LENGTH,
      includeContext: false,
    });
  } catch (error) {
    console.error("Conversation memory search failed:", error);
    return [];
  }
}

/**
 * Get context-aware character information using similarity search
 */
export async function getContextualCharacterData(
  adventureId: string,
  contextQuery: string,
  options: {
    maxTraits?: number;
    includeConversationContext?: boolean;
  } = {}
): Promise<{
  relevantTraits: string[];
  conversationContext: string[];
  searchMetadata: any;
}> {
  const { maxTraits = 5, includeConversationContext = true } = options;

  const searchResult = await performSimilaritySearch(
    {
      adventureId,
      searchQuery: contextQuery,
      searchType: "general",
    },
    {
      maxResults: maxTraits * 2, // Get more results to filter
      includeConversationHistory: includeConversationContext,
    }
  );

  const relevantTraits = searchResult.results
    .filter((result) => result.type === "character_trait")
    .slice(0, maxTraits)
    .map((result) => result.content);

  const conversationContext = searchResult.results
    .filter((result) => result.type === "conversation_context")
    .slice(0, 3) // Limit conversation context
    .map((result) => result.content);

  return {
    relevantTraits,
    conversationContext,
    searchMetadata: searchResult.searchMetadata,
  };
}

/**
 * Find character trait inconsistencies using similarity search
 */
export async function findCharacterInconsistencies(
  adventureCharacterId: string,
  newTraitText: string,
  traitType: "appearance" | "personality" | "scents_aromas"
): Promise<
  Array<{
    existingTrait: string;
    conflictScore: number;
    explanation: string;
  }>
> {
  try {
    const similarTraits = await findSimilarTraits(newTraitText, adventureCharacterId, {
      limit: 5,
      similarityThreshold: 0.6, // Lower threshold to catch potential conflicts
      traitType,
    });

    const inconsistencies = [];

    for (const trait of similarTraits) {
      // Simple conflict detection based on similarity and trait type
      // High similarity might indicate redundancy or potential conflict
      if (trait.similarity_score > 0.85) {
        inconsistencies.push({
          existingTrait: trait.trait_path,
          conflictScore: trait.similarity_score,
          explanation: `High similarity (${(trait.similarity_score * 100).toFixed(1)}%) suggests potential redundancy`,
        });
      }
    }

    return inconsistencies;
  } catch (error) {
    console.error("Inconsistency detection failed:", error);
    return [];
  }
}
