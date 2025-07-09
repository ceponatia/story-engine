import { ConversationContext, ContextAnalysisResult } from "./functions/context-analyzer";
export interface TraitEnhancementResult {
    success: boolean;
    enhancedPrompt: string;
    originalPrompt: string;
    traitsInjected: string[];
    contextAnalysis: ContextAnalysisResult;
    executionTimeMs: number;
    errors: string[];
}
export declare function enhanceSystemPromptWithTraits(originalPrompt: string, conversationContext: ConversationContext, options?: {
    lookbackMessages?: number;
    confidenceThreshold?: number;
    enableFallback?: boolean;
    timeoutMs?: number;
}): Promise<TraitEnhancementResult>;
export declare function shouldEnhancePrompt(userMessage: string, recentMessages: string[]): boolean;
//# sourceMappingURL=promptEnhancement.d.ts.map