import { parseCharacterUpdate, getFieldType } from "../../parsers/character-update-parser";
function extractSimplePatterns(text) {
    const extractions = [];
    const stateChangePattern = /(?:my|her|his|their)\s+(\w+)\s+(?:is|are|became?|turned?)\s+now\s+([^.!?;]+)/gi;
    const stateChangeMatches = Array.from(text.matchAll(stateChangePattern));
    stateChangeMatches.forEach((match) => {
        const bodyPart = match[1].toLowerCase();
        const description = match[2].trim();
        const fieldType = getFieldType(bodyPart);
        if (fieldType !== "other") {
            const updateText = `${bodyPart}: ${description}`;
            const parsed = parseCharacterUpdate(updateText, fieldType);
            if (parsed) {
                extractions.push({
                    fieldType,
                    originalText: match[0],
                    extractedData: parsed.parsedData,
                    confidence: "high",
                    context: "direct_state_change",
                });
            }
        }
    });
    const emotionPattern = /(?:I|she|he|they)\s+(?:feel|felt|am|is|was|became?)\s+([^.!?;,]+)/gi;
    const emotionMatches = Array.from(text.matchAll(emotionPattern));
    emotionMatches.forEach((match) => {
        const emotionText = match[1].trim();
        if (getFieldType(emotionText) === "personality") {
            const parsed = parseCharacterUpdate(`emotion: ${emotionText}`, "personality");
            if (parsed) {
                extractions.push({
                    fieldType: "personality",
                    originalText: match[0],
                    extractedData: parsed.parsedData,
                    confidence: "medium",
                    context: "emotion_expression",
                });
            }
        }
    });
    const actionPattern = /(?:\*.*?)(?:I|she|he|they)\s+(touched|ran|brushed|adjusted|moved|shifted)\s+(?:my|her|his|their)\s+(\w+)(?:.*?\*)?/gi;
    const actionMatches = Array.from(text.matchAll(actionPattern));
    actionMatches.forEach((match) => {
        const action = match[1];
        const bodyPart = match[2].toLowerCase();
        const appearanceActions = ["brushed", "adjusted", "styled", "fixed"];
        if (appearanceActions.includes(action.toLowerCase()) &&
            ["hair", "clothes", "makeup", "face"].includes(bodyPart)) {
            extractions.push({
                fieldType: "action",
                originalText: match[0],
                extractedData: `${action} ${bodyPart}`,
                confidence: "low",
                context: "physical_action",
            });
        }
    });
    return extractions;
}
function extractStructuredPatterns(text) {
    const extractions = [];
    const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 10);
    sentences.forEach((sentence) => {
        const trimmed = sentence.trim();
        const descriptivePattern = /(?:my|her|his|their)\s+(\w+)\s+(?:was|were|is|are|became?|looked?|seemed?|appeared?)\s+([^,;]+)/gi;
        const matches = Array.from(trimmed.matchAll(descriptivePattern));
        matches.forEach((match) => {
            const attribute = match[1].toLowerCase();
            const description = match[2].trim();
            const fieldType = getFieldType(`${attribute} ${description}`);
            if (fieldType !== "other") {
                const updateText = `${attribute}: ${description}`;
                const parsed = parseCharacterUpdate(updateText, fieldType);
                if (parsed) {
                    extractions.push({
                        fieldType,
                        originalText: match[0],
                        extractedData: parsed.parsedData,
                        confidence: "medium",
                        context: "descriptive_sentence",
                    });
                }
            }
        });
        const scentPattern = /(?:smell|scent|aroma|fragrance)\s+(?:of|like)?\s*([^,;.!?]+)/gi;
        const scentMatches = Array.from(trimmed.matchAll(scentPattern));
        scentMatches.forEach((match) => {
            const scentDescription = match[1].trim();
            const parsed = parseCharacterUpdate(`scent: ${scentDescription}`, "scents");
            if (parsed) {
                extractions.push({
                    fieldType: "scents",
                    originalText: match[0],
                    extractedData: parsed.parsedData,
                    confidence: "medium",
                    context: "scent_description",
                });
            }
        });
    });
    return extractions;
}
function extractAdvancedPatterns(text) {
    const extractions = [];
    const contextualClues = [
        {
            pattern: /(?:location|place|room|area).*?(?:changed?|moved?|went?|entered?)/gi,
            type: "location",
        },
        {
            pattern: /(?:personality|character|nature).*?(?:changed?|shifted?|became?)/gi,
            type: "personality",
        },
        {
            pattern: /(?:appearance|look|style).*?(?:changed?|different|new)/gi,
            type: "appearance",
        },
    ];
    contextualClues.forEach(({ pattern, type }) => {
        const matches = Array.from(text.matchAll(pattern));
        matches.forEach((match) => {
            extractions.push({
                fieldType: type,
                originalText: match[0],
                extractedData: match[0].trim(),
                confidence: "low",
                context: "contextual_clue",
            });
        });
    });
    return extractions;
}
export async function extractStateFromResponse(responseText, adventureId, options = {}) {
    const startTime = Date.now();
    const { enableSimplePatterns = true, enableStructuredPatterns = true, enableAdvancedPatterns = false, minConfidence = "low", } = options;
    let allExtractions = [];
    if (enableSimplePatterns) {
        const simpleExtractions = extractSimplePatterns(responseText);
        allExtractions = allExtractions.concat(simpleExtractions);
    }
    if (enableStructuredPatterns) {
        const structuredExtractions = extractStructuredPatterns(responseText);
        allExtractions = allExtractions.concat(structuredExtractions);
    }
    if (enableAdvancedPatterns) {
        const advancedExtractions = extractAdvancedPatterns(responseText);
        allExtractions = allExtractions.concat(advancedExtractions);
    }
    const confidenceLevels = { low: 1, medium: 2, high: 3 };
    const minLevel = confidenceLevels[minConfidence];
    const filteredExtractions = allExtractions.filter((ext) => confidenceLevels[ext.confidence] >= minLevel);
    const uniqueExtractions = filteredExtractions.filter((ext, index, arr) => arr.findIndex((other) => JSON.stringify(other.extractedData) === JSON.stringify(ext.extractedData)) === index);
    const processingTime = Date.now() - startTime;
    const highConfidenceCount = uniqueExtractions.filter((ext) => ext.confidence === "high").length;
    return {
        extractions: uniqueExtractions,
        metadata: {
            responseLength: responseText.length,
            extractionCount: uniqueExtractions.length,
            highConfidenceCount,
            processingTime,
        },
    };
}
export const DEFAULT_EXTRACTION_CONFIG = {
    enabled: true,
    mode: "conservative",
    minConfidence: "medium",
    enabledFeatures: {
        simplePatterns: true,
        structuredPatterns: true,
        advancedPatterns: false,
    },
};
export function getExtractionConfig(mode) {
    switch (mode) {
        case "conservative":
            return {
                simplePatterns: true,
                structuredPatterns: false,
                advancedPatterns: false,
            };
        case "balanced":
            return {
                simplePatterns: true,
                structuredPatterns: true,
                advancedPatterns: false,
            };
        case "aggressive":
            return {
                simplePatterns: true,
                structuredPatterns: true,
                advancedPatterns: true,
            };
        default:
            return DEFAULT_EXTRACTION_CONFIG.enabledFeatures;
    }
}
