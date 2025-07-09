"use server";
import { revalidatePath } from "next/cache";
import { adventureRepository, adventureCharacterRepository } from "@/lib/postgres/repositories";
import { parseCharacterUpdate, getFieldType } from "@/lib/parsers/character-update-parser";
import { requireAuth } from "@/lib/auth-helper";
import { attributeToText } from "@/lib/parsers/unified-parser";
import { RedisManager } from "@/lib/postgres/redis";
function convertCharacterDataToText(data, fieldType) {
    if (!data)
        return "";
    if (typeof data === "string") {
        return data;
    }
    if (typeof data === "object") {
        try {
            return attributeToText(data);
        }
        catch (error) {
            console.error(`Error converting ${fieldType} data to text:`, error);
            return typeof data === "object" ? JSON.stringify(data) : String(data);
        }
    }
    return String(data);
}
export async function updateCharacterStateFromText(adventureId, textUpdates, context) {
    const structuredUpdates = {};
    Object.entries(textUpdates).forEach(([field, text]) => {
        const fieldType = getFieldType(field);
        if (fieldType !== "other") {
            const parsed = parseCharacterUpdate(text, fieldType);
            if (parsed) {
                structuredUpdates[field] = parsed.parsedData;
            }
            else {
                structuredUpdates[field] = text;
            }
        }
        else {
            structuredUpdates[field] = text;
        }
    });
    return await updateCharacterState(adventureId, structuredUpdates, context);
}
export async function updateCharacterState(adventureId, updates, context) {
    const { user } = await requireAuth();
    try {
        const adventure = await adventureRepository.getById(adventureId, user.id);
        if (!adventure) {
            throw new Error("Adventure not found or not accessible");
        }
        const character = await adventureCharacterRepository.getByAdventure(adventureId, user.id);
        if (!character) {
            throw new Error("Adventure character not found");
        }
        const timestamp = new Date().toISOString();
        const stateUpdates = {};
        Object.entries(updates).forEach(([field, value]) => {
            stateUpdates[field] = {
                field,
                value,
                timestamp,
                context: context || `Updated during adventure`,
            };
        });
        const currentStateUpdates = character || {};
        const newStateUpdates = Object.assign(Object.assign({}, currentStateUpdates), stateUpdates);
        await adventureCharacterRepository.updateState(adventureId, newStateUpdates, user.id);
        try {
            const { queueEmbeddingGeneration } = await import("@/lib/ai/embedding-service");
            for (const [field, update] of Object.entries(stateUpdates)) {
                const fieldType = getFieldType(field);
                if (fieldType !== "other" && update.value) {
                    await queueEmbeddingGeneration({
                        adventureCharacterId: character.id,
                        traitType: fieldType,
                        traitPath: field,
                        traitValue: update.value,
                        context: update.context,
                    });
                }
            }
        }
        catch (embeddingError) {
            console.warn("Failed to generate embeddings for character state update:", embeddingError);
        }
        await RedisManager.invalidateCharacterContext(adventureId);
        console.debug(`Invalidated character context cache for: ${adventureId}`);
        revalidatePath(`/adventures/${adventureId}/chat`);
        return { success: true, updates: stateUpdates };
    }
    catch (error) {
        console.error("Error updating character state:", error);
        throw error;
    }
}
export async function getCharacterState(adventureId) {
    const { user } = await requireAuth();
    try {
        const stateUpdates = await adventureCharacterRepository.getByAdventure(adventureId, user.id);
        const character = {
            name: "Adventure Character",
            personality: "Dynamic personality",
            background: "Adventure background",
            state_updates: stateUpdates,
            user_id: user.id,
            appearance: "Dynamic appearance",
            fragrances: "Dynamic scents",
        };
        return {
            success: true,
            character: Object.assign(Object.assign({}, character), { state_updates: character.state_updates || {} }),
        };
    }
    catch (error) {
        console.error("Error getting character state:", error);
        throw error;
    }
}
export async function buildCharacterContext(adventureId) {
    try {
        const cachedContext = await RedisManager.getCachedCharacterContext(adventureId);
        if (cachedContext) {
            console.debug(`Cache hit for character context: ${adventureId}`);
            return cachedContext;
        }
        console.debug(`Cache miss for character context: ${adventureId}`);
        const character = await adventureCharacterRepository.getByAdventure(adventureId);
        if (!character) {
            return "";
        }
        const { user } = await requireAuth();
        const stateUpdates = await adventureCharacterRepository.getByAdventure(adventureId, user.id);
        let context = `You are ${character.name}, age ${character.age}.`;
        if (character.background) {
            context += ` Background: ${character.background}`;
        }
        if (character.personality) {
            const personality = convertCharacterDataToText(character.personality, "personality");
            if (personality.trim()) {
                context += `\nPersonality: ${personality}`;
            }
        }
        if (character.appearance) {
            const physical = convertCharacterDataToText(character.appearance, "appearance");
            if (physical.trim()) {
                context += `\nPhysical attributes: ${physical}`;
            }
        }
        if (character.scents_aromas) {
            const scents = convertCharacterDataToText(character.scents_aromas, "scents");
            if (scents.trim()) {
                context += `\nDistinctive scents: ${scents}`;
            }
        }
        const currentState = [];
        if (stateUpdates) {
            Object.entries(stateUpdates.state_updates || {}).forEach(([key, update]) => {
                if (update && typeof update === "object" && "value" in update && update.value) {
                    const fieldType = getFieldType(key);
                    let formattedValue;
                    if (fieldType === "other") {
                        formattedValue =
                            typeof update.value === "object"
                                ? JSON.stringify(update.value)
                                : String(update.value);
                    }
                    else {
                        formattedValue = convertCharacterDataToText(update.value, fieldType);
                    }
                    if (formattedValue.trim()) {
                        currentState.push(`${key}: ${formattedValue}`);
                    }
                }
            });
        }
        if (currentState.length > 0) {
            context += `\n\nCurrent state changes: ${currentState.join(", ")}`;
        }
        const finalContext = context.trim();
        await RedisManager.cacheCharacterContext(adventureId, finalContext, 300);
        console.debug(`Cached character context for: ${adventureId}`);
        return finalContext;
    }
    catch (error) {
        console.error("Error building character context:", error);
        return "";
    }
}
