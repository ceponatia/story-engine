import { adventureCharacterRepository } from "@/lib/postgres/repositories";
import { mergeAttributes } from "../../parsers/unified-parser";
function processExtractions(extractions) {
    const updates = {};
    const timestamp = new Date().toISOString();
    extractions.forEach((extraction, index) => {
        const fieldKey = `auto_extracted_${extraction.fieldType}_${index}`;
        updates[fieldKey] = {
            field: fieldKey,
            oldValue: null,
            newValue: extraction.extractedData,
            timestamp,
            context: `Automated extraction: ${extraction.context} - "${extraction.originalText}"`,
            confidence: extraction.confidence,
            source: "automated_extraction",
        };
    });
    return updates;
}
function mergeWithExistingState(existingState, newUpdates) {
    const mergedUpdates = Object.assign({}, newUpdates);
    Object.entries(newUpdates).forEach(([key, update]) => {
        if (existingState[key]) {
            mergedUpdates[key] = Object.assign(Object.assign({}, update), { oldValue: existingState[key] });
            if (typeof update.newValue === "object" &&
                typeof existingState[key] === "object" &&
                update.newValue !== null &&
                existingState[key] !== null) {
                try {
                    const existingData = existingState[key];
                    const newData = update.newValue;
                    const merged = mergeAttributes(existingData, newData);
                    mergedUpdates[key] = Object.assign(Object.assign({}, update), { newValue: merged, context: `${update.context} (merged with existing data)` });
                }
                catch (error) {
                    console.warn("Failed to merge state data:", error);
                }
            }
        }
    });
    return mergedUpdates;
}
function generateStateEvents(updates) {
    const events = [];
    const timestamp = new Date().toISOString();
    const updatesByType = {};
    Object.values(updates).forEach((update) => {
        const type = update.field.includes("appearance")
            ? "appearance"
            : update.field.includes("personality")
                ? "personality"
                : update.field.includes("scents")
                    ? "scents"
                    : "other";
        if (!updatesByType[type]) {
            updatesByType[type] = [];
        }
        updatesByType[type].push(update);
    });
    Object.entries(updatesByType).forEach(([type, typeUpdates]) => {
        const highConfidenceUpdates = typeUpdates.filter((u) => u.confidence === "high");
        if (highConfidenceUpdates.length > 0) {
            const descriptions = highConfidenceUpdates.map((u) => u.context.split(" - ")[1] || "Character change detected");
            events.push({
                eventType: "state_change",
                description: `${type.charAt(0).toUpperCase() + type.slice(1)} changes detected: ${descriptions.join(", ")}`,
                timestamp,
                metadata: {
                    type,
                    updateCount: highConfidenceUpdates.length,
                    confidence: "high",
                    updates: highConfidenceUpdates.map((u) => ({
                        field: u.field,
                        newValue: u.newValue,
                        context: u.context,
                    })),
                },
            });
        }
    });
    return events;
}
export async function updateCharacterFromExtractions(adventureId, userId, extractionResult, options = {}) {
    const { minConfidence = "medium", dryRun = false, generateEvents = true } = options;
    const result = {
        success: false,
        updatesApplied: 0,
        highConfidenceUpdates: 0,
        events: [],
        errors: [],
    };
    try {
        const confidenceLevels = { low: 1, medium: 2, high: 3 };
        const minLevel = confidenceLevels[minConfidence];
        const validExtractions = extractionResult.extractions.filter((ext) => confidenceLevels[ext.confidence] >= minLevel);
        if (validExtractions.length === 0) {
            result.success = true;
            return result;
        }
        const existingState = await adventureCharacterRepository.getState(adventureId, userId);
        const newUpdates = processExtractions(validExtractions);
        const mergedUpdates = mergeWithExistingState(existingState, newUpdates);
        if (generateEvents) {
            result.events = generateStateEvents(mergedUpdates);
        }
        result.highConfidenceUpdates = Object.values(mergedUpdates).filter((u) => u.confidence === "high").length;
        if (!dryRun && Object.keys(mergedUpdates).length > 0) {
            const finalState = Object.assign(Object.assign({}, existingState), Object.fromEntries(Object.entries(mergedUpdates).map(([key, update]) => [key, update])));
            await adventureCharacterRepository.updateState(adventureId, finalState, userId);
            result.updatesApplied = Object.keys(mergedUpdates).length;
        }
        result.success = true;
    }
    catch (error) {
        console.error("Error updating character from extractions:", error);
        result.errors.push(error instanceof Error ? error.message : "Unknown error");
    }
    return result;
}
export async function getCharacterStateHistory(adventureId, userId, options = {}) {
    const { includeAutomated = true, includeManual = true, since } = options;
    try {
        const stateData = await adventureCharacterRepository.getState(adventureId, userId);
        const history = [];
        Object.entries(stateData).forEach(([key, value]) => {
            if (typeof value === "object" && value !== null && "source" in value) {
                const update = value;
                if ((includeAutomated && update.source === "automated_extraction") ||
                    (includeManual && update.source !== "automated_extraction")) {
                    if (!since || new Date(update.timestamp) >= since) {
                        history.push(update);
                    }
                }
            }
        });
        return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    catch (error) {
        console.error("Error getting character state history:", error);
        return [];
    }
}
export function analyzeCharacterDevelopment(history) {
    const analysis = {
        totalChanges: history.length,
        changesByType: {},
        confidenceDistribution: {},
        recentActivity: false,
        trends: [],
    };
    history.forEach((update) => {
        const type = update.field.includes("appearance")
            ? "appearance"
            : update.field.includes("personality")
                ? "personality"
                : update.field.includes("scents")
                    ? "scents"
                    : "other";
        analysis.changesByType[type] = (analysis.changesByType[type] || 0) + 1;
        analysis.confidenceDistribution[update.confidence] =
            (analysis.confidenceDistribution[update.confidence] || 0) + 1;
    });
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    analysis.recentActivity = history.some((update) => new Date(update.timestamp) > oneDayAgo);
    const mostActiveType = Object.entries(analysis.changesByType).sort(([, a], [, b]) => b - a)[0];
    if (mostActiveType) {
        analysis.trends.push(`Most active change type: ${mostActiveType[0]} (${mostActiveType[1]} changes)`);
    }
    const highConfidenceCount = analysis.confidenceDistribution.high || 0;
    const highConfidencePercentage = (highConfidenceCount / analysis.totalChanges) * 100;
    if (highConfidencePercentage > 50) {
        analysis.trends.push(`High confidence in character changes (${highConfidencePercentage.toFixed(1)}%)`);
    }
    return analysis;
}
