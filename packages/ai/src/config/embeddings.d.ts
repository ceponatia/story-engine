export interface EmbeddingModelConfig {
    name: string;
    dimensions: number;
    maxTokens: number;
    useCase: string[];
    performance: "fast" | "balanced" | "quality";
    availability: "required" | "recommended" | "optional";
    description: string;
}
export declare const EMBEDDING_MODELS: Record<string, EmbeddingModelConfig>;
export declare const DEFAULT_EMBEDDING_MODEL = "nomic-embed-text";
export declare const EMBEDDING_FEATURES: {
    CHARACTER_TRAIT_EMBEDDINGS: boolean;
    CONVERSATION_MEMORY: boolean;
    SEMANTIC_SEARCH: boolean;
    BACKGROUND_PROCESSING: boolean;
};
export declare const EMBEDDING_CONFIG: {
    BATCH_SIZE: number;
    MAX_RETRIES: number;
    TIMEOUT_MS: number;
    SIMILARITY_THRESHOLD: number;
    VECTOR_DIMENSIONS: number;
};
export declare function getEmbeddingModelForUseCase(useCase: string): string;
export declare function validateEmbeddingModel(modelName: string): boolean;
export declare function getEmbeddingModelConfig(modelName: string): EmbeddingModelConfig | null;
//# sourceMappingURL=embeddings.d.ts.map