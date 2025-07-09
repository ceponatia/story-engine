/**
 * Embedding Service for Story Engine RAG System
 *
 * Handles character trait embedding generation, storage, and similarity search
 * for maintaining character consistency and enhancing conversation memory.
 *
 * Integrates with character state updates and provides background processing.
 */

import { OllamaClient } from "./ollama/client";
import { saveEmbedding, findSimilarCharacterTraits } from "@/lib/postgres/repositories";
import {
  DEFAULT_EMBEDDING_MODEL,
  EMBEDDING_CONFIG,
  EMBEDDING_FEATURES,
  getEmbeddingModelForUseCase,
} from "./config/embeddings";
import { attributeToText, UnifiedParserResult } from "../parsers/unified-parser";
import { QdrantManager } from "../postgres/qdrant";

export interface CharacterTraitData {
  adventureCharacterId: string;
  traitType: "appearance" | "personality" | "scents_aromas";
  traitPath: string;
  traitValue: unknown;
  context?: string;
}

export interface EmbeddingMetadata {
  adventure_character_id: string;
  trait_type: string;
  trait_path: string;
  extraction_context?: string;
  confidence_score?: number;
  created_at: string;
}

/**
 * Generate embeddings for character traits with proper error handling
 */
export async function generateCharacterTraitEmbedding(
  traitData: CharacterTraitData
): Promise<string | null> {
  // Check if character trait embeddings are enabled
  if (!EMBEDDING_FEATURES.CHARACTER_TRAIT_EMBEDDINGS) {
    console.log("Character trait embeddings disabled, skipping generation");
    return null;
  }

  try {
    const ollama = new OllamaClient({
      timeout: EMBEDDING_CONFIG.TIMEOUT_MS,
    });

    // Convert trait value to natural language text
    const traitText = convertTraitToText(traitData.traitValue, traitData.traitType);
    if (!traitText.trim()) {
      console.log("Empty trait text, skipping embedding generation");
      return null;
    }

    // Get appropriate embedding model for character traits
    const embeddingModel = getEmbeddingModelForUseCase("character_traits");

    // Generate embedding with retry logic
    let embedding: number[] | null = null;
    let retries = 0;

    while (!embedding && retries < EMBEDDING_CONFIG.MAX_RETRIES) {
      try {
        const response = await ollama.embeddings(embeddingModel, traitText);
        embedding = response.embeddings[0];
      } catch (error) {
        retries++;
        console.warn(`Embedding generation attempt ${retries} failed:`, error);

        if (retries >= EMBEDDING_CONFIG.MAX_RETRIES) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
      }
    }

    if (!embedding) {
      throw new Error("Failed to generate embedding after retries");
    }

    // Prepare metadata
    const metadata: EmbeddingMetadata = {
      adventure_character_id: traitData.adventureCharacterId,
      trait_type: traitData.traitType,
      trait_path: traitData.traitPath,
      extraction_context: traitData.context,
      created_at: new Date().toISOString(),
    };

    // Dual-write strategy: Save to both PGVector and Qdrant
    const entityId = `${traitData.adventureCharacterId}:${traitData.traitPath}`;

    // Primary storage: PGVector (existing functionality)
    const embeddingId = await saveEmbedding("character_trait", entityId, embedding, metadata);

    // Enhanced storage: Qdrant (new vector database)
    try {
      await QdrantManager.storeVector(
        "character_traits",
        embeddingId || entityId, // Use embeddingId if available, fallback to entityId
        embedding,
        {
          ...metadata,
          entity_id: entityId,
          trait_text: traitText, // Store original text for debugging
          embedding_id: embeddingId,
        }
      );
      console.log(`Stored embedding in Qdrant for trait: ${traitData.traitPath}`);
    } catch (qdrantError) {
      // Don't fail the entire operation if Qdrant storage fails
      console.warn("Failed to store embedding in Qdrant (fallback to PGVector only):", qdrantError);
    }

    console.log(`Generated embedding for character trait: ${traitData.traitPath}`);
    return embeddingId;
  } catch (error) {
    console.error("Failed to generate character trait embedding:", error);
    return null;
  }
}

/**
 * Find similar character traits using vector similarity search
 * Enhanced with Qdrant for faster search and advanced filtering, with PGVector fallback
 */
export async function findSimilarTraits(
  queryText: string,
  adventureCharacterId: string,
  options: {
    limit?: number;
    similarityThreshold?: number;
    traitType?: string;
    preferQdrant?: boolean;
  } = {}
): Promise<
  Array<{
    trait_path: string;
    similarity_score: number;
    metadata: EmbeddingMetadata;
  }>
> {
  if (!EMBEDDING_FEATURES.SEMANTIC_SEARCH) {
    console.log("Semantic search disabled, returning empty results");
    return [];
  }

  const {
    limit = 10,
    similarityThreshold = EMBEDDING_CONFIG.SIMILARITY_THRESHOLD,
    traitType,
    preferQdrant = true,
  } = options;

  try {
    const ollama = new OllamaClient({
      timeout: EMBEDDING_CONFIG.TIMEOUT_MS,
    });

    // Generate query embedding
    const embeddingModel = getEmbeddingModelForUseCase("character_traits");
    const response = await ollama.embeddings(embeddingModel, queryText);
    const queryEmbedding = response.embeddings[0];

    // Try Qdrant first for enhanced performance and filtering
    if (preferQdrant) {
      try {
        const qdrantFilter: Record<string, any> = {
          adventure_character_id: adventureCharacterId,
        };

        if (traitType) {
          qdrantFilter.trait_type = traitType;
        }

        const qdrantResults = await QdrantManager.searchSimilar(
          "character_traits",
          queryEmbedding,
          {
            limit,
            scoreThreshold: similarityThreshold,
            filter: qdrantFilter,
            withPayload: true,
          }
        );

        // Convert Qdrant results to expected format
        const formattedResults = qdrantResults.map((result) => ({
          trait_path: result.payload.trait_path as string,
          similarity_score: result.score,
          metadata: {
            adventure_character_id: result.payload.adventure_character_id,
            trait_type: result.payload.trait_type,
            trait_path: result.payload.trait_path,
            extraction_context: result.payload.extraction_context,
            confidence_score: result.payload.confidence_score,
            created_at: result.payload.created_at,
          } as EmbeddingMetadata,
        }));

        console.debug(
          `Qdrant search returned ${formattedResults.length} results for character ${adventureCharacterId}`
        );
        return formattedResults;
      } catch (qdrantError) {
        console.warn("Qdrant search failed, falling back to PGVector:", qdrantError);
        // Fall through to PGVector fallback
      }
    }

    // Fallback to PGVector (existing functionality)
    console.debug("Using PGVector for similarity search");
    const results = await findSimilarCharacterTraits(
      queryEmbedding,
      "character_trait",
      limit,
      similarityThreshold
    );

    // Filter by adventure character and trait type if specified
    return results
      .filter((result: any) => {
        const metadata = result.metadata as EmbeddingMetadata;
        if (metadata.adventure_character_id !== adventureCharacterId) {
          return false;
        }
        if (traitType && metadata.trait_type !== traitType) {
          return false;
        }
        return true;
      })
      .map((result: any) => ({
        trait_path: (result.metadata as EmbeddingMetadata).trait_path,
        similarity_score: result.similarity_score,
        metadata: result.metadata as EmbeddingMetadata,
      }));
  } catch (error) {
    console.error("Failed to find similar traits:", error);
    return [];
  }
}

/**
 * Generate embeddings for multiple character traits in batch
 */
export async function generateBatchCharacterEmbeddings(
  traits: CharacterTraitData[]
): Promise<Array<{ traitPath: string; embeddingId: string | null }>> {
  const results: Array<{ traitPath: string; embeddingId: string | null }> = [];

  // Process in batches to avoid overwhelming the system
  const batchSize = EMBEDDING_CONFIG.BATCH_SIZE;

  for (let i = 0; i < traits.length; i += batchSize) {
    const batch = traits.slice(i, i + batchSize);

    const batchPromises = batch.map(async (trait) => {
      const embeddingId = await generateCharacterTraitEmbedding(trait);
      return { traitPath: trait.traitPath, embeddingId };
    });

    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result, index) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        console.error(`Failed to process trait ${batch[index].traitPath}:`, result.reason);
        results.push({ traitPath: batch[index].traitPath, embeddingId: null });
      }
    });

    // Small delay between batches to prevent overwhelming the embedding model
    if (i + batchSize < traits.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Convert character trait value to natural language text for embedding
 */
function convertTraitToText(traitValue: unknown, traitType: string): string {
  if (!traitValue) return "";

  if (typeof traitValue === "string") {
    return traitValue;
  }

  if (typeof traitValue === "object") {
    try {
      // Convert to UnifiedParserResult format (ensure all values are string arrays)
      const convertedData: UnifiedParserResult = {};
      Object.entries(traitValue as Record<string, unknown>).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          convertedData[key] = value.map(String);
        } else if (value !== null && value !== undefined) {
          convertedData[key] = [String(value)];
        }
      });

      // Use the unified parser's attributeToText function
      return attributeToText(convertedData);
    } catch (error) {
      console.warn("Failed to convert trait object to text:", error);
      return JSON.stringify(traitValue);
    }
  }

  return String(traitValue);
}

/**
 * Queue embedding generation for background processing
 */
export async function queueEmbeddingGeneration(
  traitData: CharacterTraitData
): Promise<string | null> {
  if (EMBEDDING_FEATURES.BACKGROUND_PROCESSING) {
    try {
      const { jobRepository } = await import("@/lib/postgres/repositories");
      const createEmbeddingJob = jobRepository.createEmbeddingJob.bind(jobRepository);

      const jobId = await createEmbeddingJob({
        adventureCharacterId: traitData.adventureCharacterId,
        traitType: traitData.traitType,
        traitPath: traitData.traitPath,
        traitValue: traitData.traitValue,
        context: traitData.context,
      });

      console.log(`Queued embedding job ${jobId} for trait: ${traitData.traitPath}`);
      return jobId;
    } catch (error) {
      console.error("Failed to queue embedding job:", error);
      // Fall back to synchronous processing
      await generateCharacterTraitEmbedding(traitData);
      return null;
    }
  }

  // Process synchronously if background processing is disabled
  await generateCharacterTraitEmbedding(traitData);
  return null;
}
