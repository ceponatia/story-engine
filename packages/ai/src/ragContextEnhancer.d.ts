export interface EnhancedContext {
    baseCharacterContext: string;
    relevantTraits: string[];
    conversationMemory: string[];
    similarityInsights: string[];
    enhancementMetadata: {
        traitsFound: number;
        memoryContexts: number;
        processingTime: number;
        ragEnabled: boolean;
    };
}
export interface ContextEnhancementOptions {
    includeRecentMessages?: number;
    maxRelevantTraits?: number;
    similarityThreshold?: number;
    enableRAGMemory?: boolean;
    conversationAnalysis?: boolean;
}
export declare function enhanceCharacterContext(adventureId: string, userMessage: string, options?: ContextEnhancementOptions): Promise<EnhancedContext>;
export declare function formatEnhancedContextForPrompt(context: EnhancedContext): string;
export declare function analyzeCharacterConsistency(adventureId: string, recentMessages?: number): Promise<{
    consistencyScore: number;
    potentialIssues: string[];
    recommendations: string[];
}>;
export declare function buildRAGEnhancedSystemPrompt(adventureId: string, baseSystemPrompt: string, userMessage: string): Promise<string>;
//# sourceMappingURL=ragContextEnhancer.d.ts.map