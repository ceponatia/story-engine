export { extractStateFromResponse, DEFAULT_EXTRACTION_CONFIG, getExtractionConfig, } from "./state-extractor";
export { updateCharacterFromExtractions, getCharacterStateHistory, analyzeCharacterDevelopment, } from "./character-tracker";
export { analyzeConversationContext, getContextualCharacterInfo, executeAttributeQueries, ATTRIBUTE_SCHEMA, } from "./context-analyzer";
export { get_trait_info, get_predefined_trait, get_multiple_traits, character_exists, } from "./getTraitInfo";
export async function processLLMResponse(responseText, adventureId, userId, options = {}) {
    const { extractionMode = "conservative", minConfidence = "medium", dryRun = false, skipStateExtraction = false, } = options;
    const result = {
        success: false,
        errors: [],
    };
    try {
        if (skipStateExtraction) {
            result.success = true;
            return result;
        }
        const { extractStateFromResponse, getExtractionConfig } = await import("./state-extractor");
        const { updateCharacterFromExtractions } = await import("./character-tracker");
        const extractionConfig = getExtractionConfig(extractionMode);
        const stateExtraction = await extractStateFromResponse(responseText, adventureId, Object.assign(Object.assign({}, extractionConfig), { minConfidence }));
        result.stateExtraction = stateExtraction;
        if (stateExtraction.extractions.length > 0) {
            const stateUpdate = await updateCharacterFromExtractions(adventureId, userId, stateExtraction, {
                minConfidence,
                dryRun,
                generateEvents: true,
            });
            result.stateUpdate = stateUpdate;
            if (!stateUpdate.success) {
                result.errors = result.errors.concat(stateUpdate.errors);
            }
        }
        result.success = true;
    }
    catch (error) {
        console.error("Error processing LLM response for state extraction:", error);
        result.errors.push(error instanceof Error ? error.message : "Unknown error");
    }
    return result;
}
export const DEFAULT_AUTOMATED_STATE_CONFIG = {
    enabled: true,
    extractionMode: "conservative",
    minConfidence: "medium",
    enabledFor: {
        romance: true,
        action: false,
        general: true,
    },
};
export function getAutomatedStateConfig(adventureType) {
    const config = Object.assign({}, DEFAULT_AUTOMATED_STATE_CONFIG);
    switch (adventureType) {
        case "romance":
            config.extractionMode = "balanced";
            config.minConfidence = "medium";
            break;
        case "action":
            config.extractionMode = "conservative";
            config.minConfidence = "high";
            break;
        case "general":
            config.extractionMode = "conservative";
            config.minConfidence = "medium";
            break;
    }
    return config;
}
