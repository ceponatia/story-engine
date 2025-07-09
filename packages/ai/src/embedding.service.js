import { OllamaClient } from "./ollama/client";
import { saveEmbedding, findSimilarCharacterTraits } from "@/lib/postgres/repositories";
import { EMBEDDING_CONFIG, EMBEDDING_FEATURES, getEmbeddingModelForUseCase, } from "./config/embeddings";
import { attributeToText } from "../parsers/unified-parser";
import { QdrantManager } from "../postgres/qdrant";
export async function generateCharacterTraitEmbedding(traitData) {
    if (!EMBEDDING_FEATURES.CHARACTER_TRAIT_EMBEDDINGS) {
        console.log("Character trait embeddings disabled, skipping generation");
        return null;
    }
    try {
        const ollama = new OllamaClient({
            timeout: EMBEDDING_CONFIG.TIMEOUT_MS,
        });
        const traitText = convertTraitToText(traitData.traitValue, traitData.traitType);
        if (!traitText.trim()) {
            console.log("Empty trait text, skipping embedding generation");
            return null;
        }
        const embeddingModel = getEmbeddingModelForUseCase("character_traits");
        let embedding = null;
        let retries = 0;
        while (!embedding && retries < EMBEDDING_CONFIG.MAX_RETRIES) {
            try {
                const response = await ollama.embeddings(embeddingModel, traitText);
                embedding = response.embeddings[0];
            }
            catch (error) {
                retries++;
                console.warn(`Embedding generation attempt ${retries} failed:`, error);
                if (retries >= EMBEDDING_CONFIG.MAX_RETRIES) {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
            }
        }
        if (!embedding) {
            throw new Error("Failed to generate embedding after retries");
        }
        const metadata = {
            adventure_character_id: traitData.adventureCharacterId,
            trait_type: traitData.traitType,
            trait_path: traitData.traitPath,
            extraction_context: traitData.context,
            created_at: new Date().toISOString(),
        };
        const entityId = `${traitData.adventureCharacterId}:${traitData.traitPath}`;
        const embeddingId = await saveEmbedding("character_trait", entityId, embedding, metadata);
        try {
            await QdrantManager.storeVector("character_traits", embeddingId || entityId, embedding, Object.assign(Object.assign({}, metadata), { entity_id: entityId, trait_text: traitText, embedding_id: embeddingId }));
            console.log(`Stored embedding in Qdrant for trait: ${traitData.traitPath}`);
        }
        catch (qdrantError) {
            console.warn("Failed to store embedding in Qdrant (fallback to PGVector only):", qdrantError);
        }
        console.log(`Generated embedding for character trait: ${traitData.traitPath}`);
        return embeddingId;
    }
    catch (error) {
        console.error("Failed to generate character trait embedding:", error);
        return null;
    }
}
export async function findSimilarTraits(queryText, adventureCharacterId, options = {}) {
    if (!EMBEDDING_FEATURES.SEMANTIC_SEARCH) {
        console.log("Semantic search disabled, returning empty results");
        return [];
    }
    const { limit = 10, similarityThreshold = EMBEDDING_CONFIG.SIMILARITY_THRESHOLD, traitType, preferQdrant = true, } = options;
    try {
        const ollama = new OllamaClient({
            timeout: EMBEDDING_CONFIG.TIMEOUT_MS,
        });
        const embeddingModel = getEmbeddingModelForUseCase("character_traits");
        const response = await ollama.embeddings(embeddingModel, queryText);
        const queryEmbedding = response.embeddings[0];
        if (preferQdrant) {
            try {
                const qdrantFilter = {
                    adventure_character_id: adventureCharacterId,
                };
                if (traitType) {
                    qdrantFilter.trait_type = traitType;
                }
                const qdrantResults = await QdrantManager.searchSimilar("character_traits", queryEmbedding, {
                    limit,
                    scoreThreshold: similarityThreshold,
                    filter: qdrantFilter,
                    withPayload: true,
                });
                const formattedResults = qdrantResults.map((result) => ({
                    trait_path: result.payload.trait_path,
                    similarity_score: result.score,
                    metadata: {
                        adventure_character_id: result.payload.adventure_character_id,
                        trait_type: result.payload.trait_type,
                        trait_path: result.payload.trait_path,
                        extraction_context: result.payload.extraction_context,
                        confidence_score: result.payload.confidence_score,
                        created_at: result.payload.created_at,
                    },
                }));
                console.debug(`Qdrant search returned ${formattedResults.length} results for character ${adventureCharacterId}`);
                return formattedResults;
            }
            catch (qdrantError) {
                console.warn("Qdrant search failed, falling back to PGVector:", qdrantError);
            }
        }
        console.debug("Using PGVector for similarity search");
        const results = await findSimilarCharacterTraits(queryEmbedding, "character_trait", limit, similarityThreshold);
        return results
            .filter((result) => {
            const metadata = result.metadata;
            if (metadata.adventure_character_id !== adventureCharacterId) {
                return false;
            }
            if (traitType && metadata.trait_type !== traitType) {
                return false;
            }
            return true;
        })
            .map((result) => ({
            trait_path: result.metadata.trait_path,
            similarity_score: result.similarity_score,
            metadata: result.metadata,
        }));
    }
    catch (error) {
        console.error("Failed to find similar traits:", error);
        return [];
    }
}
export async function generateBatchCharacterEmbeddings(traits) {
    const results = [];
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
            }
            else {
                console.error(`Failed to process trait ${batch[index].traitPath}:`, result.reason);
                results.push({ traitPath: batch[index].traitPath, embeddingId: null });
            }
        });
        if (i + batchSize < traits.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }
    return results;
}
function convertTraitToText(traitValue, traitType) {
    if (!traitValue)
        return "";
    if (typeof traitValue === "string") {
        return traitValue;
    }
    if (typeof traitValue === "object") {
        try {
            const convertedData = {};
            Object.entries(traitValue).forEach(([key, value]) => {
                if (Array.isArray(value)) {
                    convertedData[key] = value.map(String);
                }
                else if (value !== null && value !== undefined) {
                    convertedData[key] = [String(value)];
                }
            });
            return attributeToText(convertedData);
        }
        catch (error) {
            console.warn("Failed to convert trait object to text:", error);
            return JSON.stringify(traitValue);
        }
    }
    return String(traitValue);
}
export async function queueEmbeddingGeneration(traitData) {
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
        }
        catch (error) {
            console.error("Failed to queue embedding job:", error);
            await generateCharacterTraitEmbedding(traitData);
            return null;
        }
    }
    await generateCharacterTraitEmbedding(traitData);
    return null;
}
