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
export declare function generateCharacterTraitEmbedding(traitData: CharacterTraitData): Promise<string | null>;
export declare function findSimilarTraits(queryText: string, adventureCharacterId: string, options?: {
    limit?: number;
    similarityThreshold?: number;
    traitType?: string;
    preferQdrant?: boolean;
}): Promise<Array<{
    trait_path: string;
    similarity_score: number;
    metadata: EmbeddingMetadata;
}>>;
export declare function generateBatchCharacterEmbeddings(traits: CharacterTraitData[]): Promise<Array<{
    traitPath: string;
    embeddingId: string | null;
}>>;
export declare function queueEmbeddingGeneration(traitData: CharacterTraitData): Promise<string | null>;
//# sourceMappingURL=embedding.service.d.ts.map