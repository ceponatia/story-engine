export { extractStateFromResponse, DEFAULT_EXTRACTION_CONFIG, getExtractionConfig, } from "./state-extractor";
export type { StateExtraction, StateExtractionResult, StateExtractionConfig, } from "./state-extractor";
import type { StateExtractionResult } from "./state-extractor";
import type { StateUpdateResult } from "./character-tracker";
export { updateCharacterFromExtractions, getCharacterStateHistory, analyzeCharacterDevelopment, } from "./character-tracker";
export type { StateUpdate, CharacterStateEvent, StateUpdateResult } from "./character-tracker";
export { analyzeConversationContext, getContextualCharacterInfo, executeAttributeQueries, ATTRIBUTE_SCHEMA, } from "./context-analyzer";
export type { ConversationContext, AttributeQuery, ContextAnalysisResult, } from "./context-analyzer";
export { get_trait_info, get_predefined_trait, get_multiple_traits, character_exists, } from "./getTraitInfo";
export type { TraitKey, TraitInfoRequest, TraitInfoResponse, TraitInfoSuccess, TraitInfoError, ValidColumn, } from "./getTraitInfo";
export declare function processLLMResponse(responseText: string, adventureId: string, userId: string, options?: {
    extractionMode?: "conservative" | "balanced" | "aggressive";
    minConfidence?: "low" | "medium" | "high";
    dryRun?: boolean;
    skipStateExtraction?: boolean;
}): Promise<{
    stateExtraction?: StateExtractionResult;
    stateUpdate?: StateUpdateResult;
    success: boolean;
    errors: string[];
}>;
export interface AutomatedStateConfig {
    enabled: boolean;
    extractionMode: "conservative" | "balanced" | "aggressive";
    minConfidence: "low" | "medium" | "high";
    enabledFor: {
        romance: boolean;
        action: boolean;
        general: boolean;
    };
}
export declare const DEFAULT_AUTOMATED_STATE_CONFIG: AutomatedStateConfig;
export declare function getAutomatedStateConfig(adventureType?: string): AutomatedStateConfig;
//# sourceMappingURL=index.d.ts.map