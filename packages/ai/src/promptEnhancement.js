import { getContextualCharacterInfo, } from "./functions/context-analyzer";
function formatTraitDataForPrompt(traitResponses) {
    const traitDescriptions = [];
    for (const response of traitResponses) {
        if (response.success && response.data) {
            const { column, path, value, dataType } = response.data;
            if (value === null || value === undefined) {
                continue;
            }
            let description = "";
            if (column === "appearance") {
                if (path === null || path === void 0 ? void 0 : path.includes("feet")) {
                    description = formatAppearanceTrait("feet", path, value);
                }
                else if (path === null || path === void 0 ? void 0 : path.includes("hair")) {
                    description = formatAppearanceTrait("hair", path, value);
                }
                else if (path === null || path === void 0 ? void 0 : path.includes("eyes")) {
                    description = formatAppearanceTrait("eyes", path, value);
                }
                else if (path === null || path === void 0 ? void 0 : path.includes("body")) {
                    description = formatAppearanceTrait("body", path, value);
                }
                else {
                    description = formatGenericTrait("appearance", path, value);
                }
            }
            else if (column === "scents_aromas") {
                description = formatScentTrait(path, value);
            }
            else if (column === "personality") {
                description = formatPersonalityTrait(path, value);
            }
            else if (column === "background") {
                description = formatBackgroundTrait(path, value);
            }
            else {
                description = formatGenericTrait(column, path, value);
            }
            if (description) {
                traitDescriptions.push(description);
            }
        }
    }
    return traitDescriptions.join(" ");
}
function formatAppearanceTrait(bodyPart, path, value) {
    const valueStr = formatValue(value);
    if (!valueStr)
        return "";
    if (bodyPart === "feet") {
        if (path === null || path === void 0 ? void 0 : path.includes("size")) {
            return `Your feet are ${valueStr}.`;
        }
        else if ((path === null || path === void 0 ? void 0 : path.includes("appearance")) || (path === null || path === void 0 ? void 0 : path.includes("look"))) {
            return `Your feet look ${valueStr}.`;
        }
        else {
            return `About your feet: ${valueStr}.`;
        }
    }
    else if (bodyPart === "hair") {
        if (path === null || path === void 0 ? void 0 : path.includes("color")) {
            return `Your hair is ${valueStr}.`;
        }
        else if (path === null || path === void 0 ? void 0 : path.includes("style")) {
            return `Your hair is styled ${valueStr}.`;
        }
        else {
            return `Your hair: ${valueStr}.`;
        }
    }
    else if (bodyPart === "eyes") {
        if (path === null || path === void 0 ? void 0 : path.includes("color")) {
            return `Your eyes are ${valueStr}.`;
        }
        else {
            return `Your eyes: ${valueStr}.`;
        }
    }
    else if (bodyPart === "body") {
        if (path === null || path === void 0 ? void 0 : path.includes("height")) {
            return `You are ${valueStr} tall.`;
        }
        else if (path === null || path === void 0 ? void 0 : path.includes("build")) {
            return `You have a ${valueStr} build.`;
        }
        else {
            return `Your body: ${valueStr}.`;
        }
    }
    return `Your ${bodyPart}: ${valueStr}.`;
}
function formatScentTrait(path, value) {
    const valueStr = formatValue(value);
    if (!valueStr)
        return "";
    if (path === null || path === void 0 ? void 0 : path.includes("feet")) {
        return `Your feet smell ${valueStr}.`;
    }
    else if (path === null || path === void 0 ? void 0 : path.includes("hair")) {
        return `Your hair smells like ${valueStr}.`;
    }
    else if (path === null || path === void 0 ? void 0 : path.includes("body")) {
        return `Your natural scent is ${valueStr}.`;
    }
    else {
        return `You smell like ${valueStr}.`;
    }
}
function formatPersonalityTrait(path, value) {
    const valueStr = formatValue(value);
    if (!valueStr)
        return "";
    if (path === null || path === void 0 ? void 0 : path.includes("traits")) {
        return `You are ${valueStr}.`;
    }
    else if (path === null || path === void 0 ? void 0 : path.includes("emotional_state")) {
        return `You are currently feeling ${valueStr}.`;
    }
    else if (path === null || path === void 0 ? void 0 : path.includes("behavioral_patterns")) {
        return `You typically ${valueStr}.`;
    }
    else {
        return `Your personality: ${valueStr}.`;
    }
}
function formatBackgroundTrait(path, value) {
    const valueStr = formatValue(value);
    if (!valueStr)
        return "";
    if (path === null || path === void 0 ? void 0 : path.includes("occupation")) {
        return `You work as ${valueStr}.`;
    }
    else {
        return `Your background: ${valueStr}.`;
    }
}
function formatGenericTrait(column, path, value) {
    const valueStr = formatValue(value);
    if (!valueStr)
        return "";
    const pathDesc = path ? ` (${path})` : "";
    return `${column}${pathDesc}: ${valueStr}.`;
}
function formatValue(value) {
    if (value === null || value === undefined) {
        return "";
    }
    if (typeof value === "string") {
        return value.trim();
    }
    if (typeof value === "number" || typeof value === "boolean") {
        return String(value);
    }
    if (Array.isArray(value)) {
        const stringItems = value
            .filter((item) => item !== null && item !== undefined)
            .map((item) => String(item).trim())
            .filter((item) => item.length > 0);
        if (stringItems.length === 0)
            return "";
        if (stringItems.length === 1)
            return stringItems[0];
        if (stringItems.length === 2)
            return `${stringItems[0]} and ${stringItems[1]}`;
        const lastItem = stringItems.pop();
        return `${stringItems.join(", ")}, and ${lastItem}`;
    }
    if (typeof value === "object") {
        try {
            const obj = value;
            const descriptions = [];
            for (const [key, val] of Object.entries(obj)) {
                if (val !== null && val !== undefined) {
                    const valStr = formatValue(val);
                    if (valStr) {
                        descriptions.push(`${key}: ${valStr}`);
                    }
                }
            }
            return descriptions.join(", ");
        }
        catch (_a) {
            return String(value);
        }
    }
    return String(value);
}
export async function enhanceSystemPromptWithTraits(originalPrompt, conversationContext, options = {}) {
    const startTime = Date.now();
    const { lookbackMessages = 5, confidenceThreshold = 0.6, enableFallback = true, timeoutMs = 3000, } = options;
    const result = {
        success: false,
        enhancedPrompt: originalPrompt,
        originalPrompt,
        traitsInjected: [],
        contextAnalysis: {
            queries: [],
            confidence: "low",
            fallbackToFullData: false,
            analysisLog: [],
        },
        executionTimeMs: 0,
        errors: [],
    };
    try {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Prompt enhancement timeout")), timeoutMs);
        });
        const enhancementPromise = async () => {
            const contextInfo = await getContextualCharacterInfo(conversationContext, {
                lookbackMessages,
                confidenceThreshold,
                enableEmbeddingSimilarity: false,
            });
            result.contextAnalysis = contextInfo.analysis;
            if (!contextInfo.data || Object.keys(contextInfo.data).length === 0) {
                result.enhancedPrompt = originalPrompt;
                result.success = true;
                result.errors.push("No relevant trait data found for context");
                return;
            }
            const traitDescriptions = [];
            for (const [key, value] of Object.entries(contextInfo.data)) {
                if (value !== null && value !== undefined) {
                    let description = "";
                    if (key.includes("appearance.")) {
                        const path = key.replace("appearance.", "");
                        description = formatAppearanceTrait("", path, value);
                    }
                    else if (key.includes("scents_aromas.")) {
                        const path = key.replace("scents_aromas.", "");
                        description = formatScentTrait(path, value);
                    }
                    else if (key.includes("personality.")) {
                        const path = key.replace("personality.", "");
                        description = formatPersonalityTrait(path, value);
                    }
                    else if (key.includes("background")) {
                        description = formatBackgroundTrait("", value);
                    }
                    else {
                        description = formatGenericTrait(key, "", value);
                    }
                    if (description) {
                        traitDescriptions.push(description);
                        result.traitsInjected.push(key);
                    }
                }
            }
            if (traitDescriptions.length > 0) {
                const traitContext = traitDescriptions.join(" ");
                let enhancedPrompt = originalPrompt;
                const insertionPatterns = [
                    /(\n\n### Character Information:?\s*)/i,
                    /(\n\n## Character:?\s*)/i,
                    /(\n\nCharacter:?\s*)/i,
                    /(\n\n### Context:?\s*)/i,
                    /(\n\n## Context:?\s*)/i,
                ];
                let inserted = false;
                for (const pattern of insertionPatterns) {
                    if (pattern.test(enhancedPrompt)) {
                        enhancedPrompt = enhancedPrompt.replace(pattern, `$1\n**Relevant Character Details:** ${traitContext}\n\n`);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    const traitSection = `\n\n**Important Character Context:** ${traitContext}`;
                    const endingPatterns = [
                        /(\n\n(?:Remember|Important|Note|Guidelines|Instructions):[\s\S]*$)/i,
                        /(\n\n---\s*$)/,
                        /(\n\n\*\*(?:Remember|Important|Note)[\s\S]*$)/i,
                    ];
                    let addedAtEnd = false;
                    for (const pattern of endingPatterns) {
                        if (pattern.test(enhancedPrompt)) {
                            enhancedPrompt = enhancedPrompt.replace(pattern, `${traitSection}$1`);
                            addedAtEnd = true;
                            break;
                        }
                    }
                    if (!addedAtEnd) {
                        enhancedPrompt = `${enhancedPrompt}${traitSection}`;
                    }
                }
                result.enhancedPrompt = enhancedPrompt;
            }
            result.success = true;
        };
        await Promise.race([enhancementPromise(), timeoutPromise]);
    }
    catch (error) {
        result.errors.push(error instanceof Error ? error.message : "Unknown error during prompt enhancement");
        result.enhancedPrompt = originalPrompt;
        result.success = false;
    }
    result.executionTimeMs = Date.now() - startTime;
    return result;
}
export function shouldEnhancePrompt(userMessage, recentMessages) {
    const combinedText = [userMessage, ...recentMessages.slice(-3)].join(" ").toLowerCase();
    const traitKeywords = [
        "feet",
        "foot",
        "hair",
        "eyes",
        "body",
        "smell",
        "scent",
        "look",
        "appearance",
        "personality",
        "feel",
        "emotion",
        "background",
        "past",
        "work",
        "job",
        "height",
        "build",
        "color",
        "style",
        "size",
        "aroma",
        "fragrance",
    ];
    return traitKeywords.some((keyword) => combinedText.includes(keyword));
}
