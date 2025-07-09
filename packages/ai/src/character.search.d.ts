import type { SearchResult } from "@story-engine/types";
export interface CharacterSearchContext {
  adventureId: string;
  adventureCharacterId?: string;
  conversationHistory?: Array<{
    role: string;
    content: string;
  }>;
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
export declare function performSimilaritySearch(
  context: CharacterSearchContext,
  options?: {
    maxResults?: number;
    similarityThreshold?: number;
    includeConversationHistory?: boolean;
  }
): Promise<CharacterSearchResponse>;
export declare function getContextualCharacterData(
  adventureId: string,
  contextQuery: string,
  options?: {
    maxTraits?: number;
    includeConversationContext?: boolean;
  }
): Promise<{
  relevantTraits: string[];
  conversationContext: string[];
  searchMetadata: any;
}>;
export declare function findCharacterInconsistencies(
  adventureCharacterId: string,
  newTraitText: string,
  traitType: "appearance" | "personality" | "scents_aromas"
): Promise<
  Array<{
    existingTrait: string;
    conflictScore: number;
    explanation: string;
  }>
>;
//# sourceMappingURL=character.search.d.ts.map
