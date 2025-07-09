/**
 * Embedding Model Configuration for Story Engine RAG System
 *
 * Defines recommended embedding models and their characteristics for
 * character consistency, trait analysis, and semantic search capabilities.
 *
 * Based on consensus analysis prioritizing quality, speed, and local deployment.
 */

export interface EmbeddingModelConfig {
  name: string;
  dimensions: number;
  maxTokens: number;
  useCase: string[];
  performance: "fast" | "balanced" | "quality";
  availability: "required" | "recommended" | "optional";
  description: string;
}

/**
 * Recommended embedding models for Story Engine
 * Prioritized for character consistency and semantic search
 */
export const EMBEDDING_MODELS: Record<string, EmbeddingModelConfig> = {
  "nomic-embed-text": {
    name: "nomic-embed-text",
    dimensions: 768,
    maxTokens: 2048,
    useCase: ["character_traits", "conversation_memory", "general_search"],
    performance: "balanced",
    availability: "recommended",
    description:
      "High-quality text embeddings optimized for English text, excellent for character trait analysis",
  },

  "all-minilm": {
    name: "all-minilm",
    dimensions: 384,
    maxTokens: 512,
    useCase: ["character_traits", "quick_search"],
    performance: "fast",
    availability: "optional",
    description:
      "Lightweight embeddings for fast character trait lookups and quick similarity searches",
  },

  "bge-large": {
    name: "bge-large",
    dimensions: 1024,
    maxTokens: 512,
    useCase: ["character_consistency", "detailed_analysis"],
    performance: "quality",
    availability: "optional",
    description:
      "High-dimension embeddings for nuanced character consistency and detailed trait analysis",
  },
};

/**
 * Default embedding model for Story Engine operations
 */
export const DEFAULT_EMBEDDING_MODEL = "nomic-embed-text";

/**
 * Feature flags for embedding functionality
 */
export const EMBEDDING_FEATURES = {
  CHARACTER_TRAIT_EMBEDDINGS: process.env.ENABLE_CHARACTER_EMBEDDINGS === "true",
  CONVERSATION_MEMORY: process.env.ENABLE_CONVERSATION_MEMORY === "true",
  SEMANTIC_SEARCH: process.env.ENABLE_SEMANTIC_SEARCH === "true",
  BACKGROUND_PROCESSING: process.env.ENABLE_BACKGROUND_EMBEDDINGS === "true",
};

/**
 * Embedding generation settings
 */
export const EMBEDDING_CONFIG = {
  BATCH_SIZE: parseInt(process.env.EMBEDDING_BATCH_SIZE || "10"),
  MAX_RETRIES: parseInt(process.env.EMBEDDING_MAX_RETRIES || "3"),
  TIMEOUT_MS: parseInt(process.env.EMBEDDING_TIMEOUT_MS || "30000"),
  SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD || "0.8"),
  VECTOR_DIMENSIONS: parseInt(process.env.VECTOR_DIMENSIONS || "768"), // Matches default nomic-embed-text model
};

/**
 * Get the appropriate embedding model for a specific use case
 */
export function getEmbeddingModelForUseCase(useCase: string): string {
  const suitableModels = Object.values(EMBEDDING_MODELS)
    .filter((model) => model.useCase.includes(useCase))
    .sort((a, b) => {
      // Prioritize by availability, then performance
      const availabilityOrder = { required: 3, recommended: 2, optional: 1 };
      const performanceOrder = { quality: 3, balanced: 2, fast: 1 };

      return (
        availabilityOrder[b.availability] - availabilityOrder[a.availability] ||
        performanceOrder[b.performance] - performanceOrder[a.performance]
      );
    });

  return suitableModels[0]?.name || DEFAULT_EMBEDDING_MODEL;
}

/**
 * Validate embedding model compatibility
 */
export function validateEmbeddingModel(modelName: string): boolean {
  return Object.keys(EMBEDDING_MODELS).includes(modelName);
}

/**
 * Get embedding model configuration
 */
export function getEmbeddingModelConfig(modelName: string): EmbeddingModelConfig | null {
  return EMBEDDING_MODELS[modelName] || null;
}
