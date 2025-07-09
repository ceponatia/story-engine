"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adventureRepository, adventureCharacterRepository, adventureMessageRepository, characterRepository, } from "@/lib/postgres/repositories";
import { requireAuth } from "@/lib/auth-helper";
import { buildSystemPrompt } from "@/lib/prompts/index";
import { buildOptimizedSystemPrompt } from "@/lib/prompts/optimized-templates";
import { getAIConfig } from "@/lib/config/validation";
export async function createAdventure(formData) {
    const { user } = await requireAuth();
    const title = formData.get("title");
    const characterId = formData.get("characterId");
    const locationId = formData.get("locationId");
    const settingId = formData.get("settingId");
    const name = formData.get("name");
    const adventureType = formData.get("adventureType");
    const initialMessage = formData.get("initialMessage");
    if (!title || !characterId || !name || !adventureType || !initialMessage) {
        throw new Error("Title, character, name, adventure type, and initial message are required");
    }
    try {
        const character = await characterRepository.getById(characterId, user.id);
        if (!character) {
            throw new Error("Character not found or not accessible");
        }
        const [adventure] = await Promise.all([
            adventureRepository.create(title, characterId, locationId && locationId !== "none" ? locationId : null, settingId && settingId !== "none" ? settingId : null, user.id, name, adventureType),
        ]);
        await adventureCharacterRepository.create(adventure.id, character.id, {
            name: character.name,
            age: character.age,
            gender: character.gender,
            appearance: character.appearance,
            scents_aromas: character.scents_aromas,
            personality: character.personality,
            background: character.background,
            avatar_url: character.avatar_url,
        }, user.id);
        const aiConfig = getAIConfig();
        const promptContext = {
            character: {
                name: character.name,
                age: character.age,
                gender: character.gender,
                personality: character.personality,
                background: character.background,
                appearance: character.appearance,
                scents_aromas: character.scents_aromas,
            },
            setting: undefined,
            location: undefined,
            userName: name,
            adventureTitle: title,
        };
        const systemPrompt = aiConfig.useOptimizedTemplates
            ? buildOptimizedSystemPrompt(adventureType, promptContext)
            : await buildSystemPrompt(promptContext, user.id);
        await adventureRepository.updateSystemPrompt(adventure.id, systemPrompt);
        await adventureMessageRepository.create(adventure.id, "assistant", initialMessage, user.id);
        revalidatePath("/");
        redirect(`/adventures/${adventure.id}/chat`);
    }
    catch (error) {
        console.error("Error creating adventure:", error);
        throw error;
    }
}
export async function sendMessage(formData) {
    const { user } = await requireAuth();
    const adventureId = formData.get("adventureId");
    const content = formData.get("content");
    if (!adventureId || !content) {
        throw new Error("Adventure ID and content are required");
    }
    try {
        const adventure = await adventureRepository.getById(adventureId, user.id);
        if (!adventure) {
            throw new Error("Adventure not found or not accessible");
        }
        const newMessage = await adventureMessageRepository.create(adventureId, "user", content.trim(), user.id);
        revalidatePath(`/adventures/${adventureId}/chat`);
        return { success: true, message: newMessage };
    }
    catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}
export async function editMessage(formData) {
    const { user } = await requireAuth();
    const messageId = formData.get("messageId");
    const content = formData.get("content");
    const adventureId = formData.get("adventureId");
    if (!messageId || !content || !adventureId) {
        throw new Error("Message ID, content, and adventure ID are required");
    }
    try {
        const adventure = await adventureRepository.getById(adventureId, user.id);
        if (!adventure) {
            throw new Error("Adventure not found or not accessible");
        }
        const updatedMessage = await adventureMessageRepository.update(messageId, content.trim(), user.id);
        revalidatePath(`/adventures/${adventureId}/chat`);
        return { success: true, message: updatedMessage };
    }
    catch (error) {
        console.error("Error editing message:", error);
        throw error;
    }
}
export async function deleteMessage(formData) {
    const { user } = await requireAuth();
    const messageId = formData.get("messageId");
    const adventureId = formData.get("adventureId");
    if (!messageId || !adventureId) {
        throw new Error("Message ID and adventure ID are required");
    }
    try {
        const adventure = await adventureRepository.getById(adventureId, user.id);
        if (!adventure) {
            throw new Error("Adventure not found or not accessible");
        }
        await adventureMessageRepository.delete(messageId, user.id);
        revalidatePath(`/adventures/${adventureId}/chat`);
        return { success: true };
    }
    catch (error) {
        console.error("Error deleting message:", error);
        throw error;
    }
}
