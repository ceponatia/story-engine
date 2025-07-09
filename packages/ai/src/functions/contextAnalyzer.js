import { adventureCharacterRepository } from "@/lib/postgres/repositories";
import { COMPREHENSIVE_ATTRIBUTE_SCHEMA, } from "../schema/attribute.schema";
export const ATTRIBUTE_SCHEMA = COMPREHENSIVE_ATTRIBUTE_SCHEMA;
export async function analyzeConversationContext(context, options = {}) {
    const { lookbackMessages = 5, confidenceThreshold = 0.6, enableEmbeddingSimilarity = false, } = options;
    const result = {
        queries: [],
        confidence: "low",
        fallbackToFullData: false,
        analysisLog: [],
    };
    try {
        const recentMessages = context.messages.slice(-lookbackMessages);
        const conversationText = recentMessages
            .map((msg) => msg.content)
            .join(" ")
            .toLowerCase();
        result.analysisLog.push(`Analyzing ${recentMessages.length} recent messages`);
        const characterId = await resolveActiveCharacter(context, conversationText);
        if (!characterId) {
            result.fallbackToFullData = true;
            result.analysisLog.push("No active character identified, falling back to full data");
            return result;
        }
        result.activeCharacter = characterId;
        result.analysisLog.push(`Active character resolved: ${characterId}`);
        const keywordMatches = performKeywordMatching(conversationText);
        result.analysisLog.push(`Found ${keywordMatches.length} keyword matches`);
        for (const match of keywordMatches) {
            if (match.confidence >= confidenceThreshold) {
                result.queries.push({
                    adventureCharacterId: characterId,
                    column: match.column,
                    path: match.path,
                    confidence: match.confidence,
                    matchedKeywords: match.keywords,
                    queryReason: `Keyword match: ${match.keywords.join(", ")}`,
                });
            }
        }
        if (result.queries.length === 0) {
            result.confidence = "low";
            result.fallbackToFullData = true;
            result.analysisLog.push("No high-confidence matches, falling back to full data");
        }
        else if (result.queries.some((q) => q.confidence > 0.8)) {
            result.confidence = "high";
        }
        else {
            result.confidence = "medium";
        }
        result.analysisLog.push(`Analysis complete with ${result.confidence} confidence`);
        return result;
    }
    catch (error) {
        console.error("Error analyzing conversation context:", error);
        result.fallbackToFullData = true;
        result.analysisLog.push(`Error occurred: ${error instanceof Error ? error.message : "Unknown error"}`);
        return result;
    }
}
async function resolveActiveCharacter(context, conversationText) {
    if (context.activeAdventureCharacterId) {
        return context.activeAdventureCharacterId;
    }
    const characterNamePatterns = [
        /(?:character|she|he|they|her|him|them)\s+(?:is|was|has|had)/gi,
        /(?:the|my|your)\s+character/gi,
    ];
    for (const pattern of characterNamePatterns) {
        if (pattern.test(conversationText)) {
            try {
                const adventureCharacter = await adventureCharacterRepository.getByAdventure(context.adventureId);
                if (adventureCharacter) {
                    return adventureCharacter.id;
                }
            }
            catch (error) {
                console.warn("Failed to get adventure characters:", error);
            }
            break;
        }
    }
    return null;
}
function performKeywordMatching(text) {
    const matches = [];
    for (const [attributeKey, schema] of Object.entries(ATTRIBUTE_SCHEMA)) {
        const foundKeywords = [];
        let totalMatches = 0;
        for (const keyword of schema.keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, "gi");
            const keywordMatches = text.match(regex);
            if (keywordMatches) {
                foundKeywords.push(keyword);
                totalMatches += keywordMatches.length;
            }
        }
        for (const alias of schema.aliases) {
            const regex = new RegExp(`\\b${alias.replace(/\s+/g, "\\s+")}\\b`, "gi");
            if (regex.test(text)) {
                foundKeywords.push(alias);
                totalMatches += 1;
            }
        }
        if (foundKeywords.length > 0) {
            const baseConfidence = Math.min(foundKeywords.length / schema.keywords.length, 1);
            const matchBonus = Math.min(totalMatches * 0.1, 0.3);
            const confidence = Math.min(baseConfidence + matchBonus, 0.95);
            matches.push({
                column: schema.column,
                path: schema.path,
                confidence,
                keywords: foundKeywords,
            });
        }
    }
    return matches.sort((a, b) => b.confidence - a.confidence);
}
export async function executeAttributeQueries(queries) {
    const results = {};
    for (const query of queries) {
        try {
            const db = (await import("../../postgres/pool")).default();
            const result = await db.query("SELECT * FROM adventure_characters WHERE id = $1", [
                query.adventureCharacterId,
            ]);
            if (result.rows.length > 0) {
                const character = result.rows[0];
                const columnData = character[query.column];
                if (query.path && typeof columnData === "object" && columnData) {
                    const pathParts = query.path.split(".");
                    let value = columnData;
                    for (const part of pathParts) {
                        if (value && typeof value === "object" && part in value) {
                            value = value[part];
                        }
                        else {
                            value = null;
                            break;
                        }
                    }
                    if (value !== null) {
                        results[`${query.column}.${query.path}`] = value;
                    }
                }
                else {
                    results[query.column] = columnData;
                }
            }
        }
        catch (error) {
            console.error(`Failed to execute query for ${query.column}:${query.path}:`, error);
        }
    }
    return results;
}
export async function getContextualCharacterInfo(context, options) {
    const analysis = await analyzeConversationContext(context, options);
    let data = {};
    if (analysis.fallbackToFullData && analysis.activeCharacter) {
        try {
            const characterData = await adventureCharacterRepository.getByAdventure(context.adventureId);
            if (characterData) {
                data = characterData;
            }
        }
        catch (error) {
            console.error("Failed to get full character data:", error);
        }
    }
    else if (analysis.queries.length > 0) {
        data = await executeAttributeQueries(analysis.queries);
    }
    return { data, analysis };
}
