export const EMBEDDING_MODELS = {
    "nomic-embed-text": {
        name: "nomic-embed-text",
        dimensions: 768,
        maxTokens: 2048,
        useCase: ["character_traits", "conversation_memory", "general_search"],
        performance: "balanced",
        availability: "recommended",
        description: "High-quality text embeddings optimized for English text, excellent for character trait analysis",
    },
    "all-minilm": {
        name: "all-minilm",
        dimensions: 384,
        maxTokens: 512,
        useCase: ["character_traits", "quick_search"],
        performance: "fast",
        availability: "optional",
        description: "Lightweight embeddings for fast character trait lookups and quick similarity searches",
    },
    "bge-large": {
        name: "bge-large",
        dimensions: 1024,
        maxTokens: 512,
        useCase: ["character_consistency", "detailed_analysis"],
        performance: "quality",
        availability: "optional",
        description: "High-dimension embeddings for nuanced character consistency and detailed trait analysis",
    },
};
export const DEFAULT_EMBEDDING_MODEL = "nomic-embed-text";
export const EMBEDDING_FEATURES = {
    CHARACTER_TRAIT_EMBEDDINGS: process.env.ENABLE_CHARACTER_EMBEDDINGS === "true",
    CONVERSATION_MEMORY: process.env.ENABLE_CONVERSATION_MEMORY === "true",
    SEMANTIC_SEARCH: process.env.ENABLE_SEMANTIC_SEARCH === "true",
    BACKGROUND_PROCESSING: process.env.ENABLE_BACKGROUND_EMBEDDINGS === "true",
};
export const EMBEDDING_CONFIG = {
    BATCH_SIZE: parseInt(process.env.EMBEDDING_BATCH_SIZE || "10"),
    MAX_RETRIES: parseInt(process.env.EMBEDDING_MAX_RETRIES || "3"),
    TIMEOUT_MS: parseInt(process.env.EMBEDDING_TIMEOUT_MS || "30000"),
    SIMILARITY_THRESHOLD: parseFloat(process.env.SIMILARITY_THRESHOLD || "0.8"),
    VECTOR_DIMENSIONS: parseInt(process.env.VECTOR_DIMENSIONS || "768"),
};
export function getEmbeddingModelForUseCase(useCase) {
    var _a;
    const suitableModels = Object.values(EMBEDDING_MODELS)
        .filter((model) => model.useCase.includes(useCase))
        .sort((a, b) => {
        const availabilityOrder = { required: 3, recommended: 2, optional: 1 };
        const performanceOrder = { quality: 3, balanced: 2, fast: 1 };
        return (availabilityOrder[b.availability] - availabilityOrder[a.availability] ||
            performanceOrder[b.performance] - performanceOrder[a.performance]);
    });
    return ((_a = suitableModels[0]) === null || _a === void 0 ? void 0 : _a.name) || DEFAULT_EMBEDDING_MODEL;
}
export function validateEmbeddingModel(modelName) {
    return Object.keys(EMBEDDING_MODELS).includes(modelName);
}
export function getEmbeddingModelConfig(modelName) {
    return EMBEDDING_MODELS[modelName] || null;
}
