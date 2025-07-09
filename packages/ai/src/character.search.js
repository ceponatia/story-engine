import { findSimilarTraits } from "./embedding-service";
import { adventureCharacterRepository, getAdventureMessages } from "@/lib/postgres/repositories";
import { DEFAULT_EMBEDDING_MODEL, EMBEDDING_CONFIG } from "./config/embeddings";
import { searchConversationMessages, conversationMatchesToSearchResults, CONVERSATION_DEFAULTS, } from "../../utils/search/conversation.parser";
export async function performSimilaritySearch(context, options = {}) {
    const startTime = Date.now();
    const { maxResults = 10, similarityThreshold = EMBEDDING_CONFIG.SIMILARITY_THRESHOLD, includeConversationHistory = true, } = options;
    const results = [];
    try {
        let characterId = context.adventureCharacterId;
        if (!characterId) {
            const adventureCharacter = await adventureCharacterRepository.getByAdventure(context.adventureId);
            characterId = adventureCharacter === null || adventureCharacter === void 0 ? void 0 : adventureCharacter.id;
        }
        if (!characterId) {
            throw new Error("No adventure character found for similarity search");
        }
        if (context.searchType === "character_traits" || context.searchType === "general") {
            const traitResults = await searchCharacterTraits(context.searchQuery, characterId, {
                limit: maxResults,
                similarityThreshold,
            });
            results.push(...traitResults);
        }
        if (includeConversationHistory &&
            (context.searchType === "conversation_memory" || context.searchType === "general")) {
            const conversationResults = await searchConversationMemory(context.searchQuery, context.adventureId, { limit: maxResults, similarityThreshold });
            results.push(...conversationResults);
        }
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
    }
    catch (error) {
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
async function searchCharacterTraits(query, adventureCharacterId, options) {
    const results = [];
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
    }
    catch (error) {
        console.error("Character trait search failed:", error);
    }
    return results;
}
async function searchConversationMemory(query, adventureId, options) {
    try {
        const recentMessages = await getAdventureMessages(adventureId, CONVERSATION_DEFAULTS.RECENT_MESSAGE_LIMIT);
        const conversationMessages = recentMessages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            created_at: msg.created_at,
            metadata: {},
        }));
        const matches = searchConversationMessages(query, conversationMessages, {
            maxResults: options.limit,
            threshold: options.similarityThreshold,
        });
        return conversationMatchesToSearchResults(matches, {
            contentTruncateLength: CONVERSATION_DEFAULTS.CONTENT_TRUNCATE_LENGTH,
            includeContext: false,
        });
    }
    catch (error) {
        console.error("Conversation memory search failed:", error);
        return [];
    }
}
export async function getContextualCharacterData(adventureId, contextQuery, options = {}) {
    const { maxTraits = 5, includeConversationContext = true } = options;
    const searchResult = await performSimilaritySearch({
        adventureId,
        searchQuery: contextQuery,
        searchType: "general",
    }, {
        maxResults: maxTraits * 2,
        includeConversationHistory: includeConversationContext,
    });
    const relevantTraits = searchResult.results
        .filter((result) => result.type === "character_trait")
        .slice(0, maxTraits)
        .map((result) => result.content);
    const conversationContext = searchResult.results
        .filter((result) => result.type === "conversation_context")
        .slice(0, 3)
        .map((result) => result.content);
    return {
        relevantTraits,
        conversationContext,
        searchMetadata: searchResult.searchMetadata,
    };
}
export async function findCharacterInconsistencies(adventureCharacterId, newTraitText, traitType) {
    try {
        const similarTraits = await findSimilarTraits(newTraitText, adventureCharacterId, {
            limit: 5,
            similarityThreshold: 0.6,
            traitType,
        });
        const inconsistencies = [];
        for (const trait of similarTraits) {
            if (trait.similarity_score > 0.85) {
                inconsistencies.push({
                    existingTrait: trait.trait_path,
                    conflictScore: trait.similarity_score,
                    explanation: `High similarity (${(trait.similarity_score * 100).toFixed(1)}%) suggests potential redundancy`,
                });
            }
        }
        return inconsistencies;
    }
    catch (error) {
        console.error("Inconsistency detection failed:", error);
        return [];
    }
}
