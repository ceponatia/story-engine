"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MongoCharacterRepository } from "@story-engine/mongodb";
import { requireAuth } from "@story-engine/auth";
import { characterCreateSchema, characterUpdateSchema } from "@story-engine/validation";
const characterRepository = new MongoCharacterRepository();
export async function getCharactersAction() {
    const { user } = await requireAuth();
    return await characterRepository.getByUser(user.id);
}
export async function getCharacterAction(id) {
    const { user } = await requireAuth();
    return await characterRepository.getById(id, user.id);
}
export async function createCharacterAction(data) {
    const { user } = await requireAuth();
    const validationResult = characterCreateSchema.safeParse(data);
    if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error.issues.map(i => i.message).join(", ")}`);
    }
    const character = await characterRepository.create(validationResult.data, user.id);
    revalidatePath("/library/characters");
    redirect(`/characters/${character.id}`);
}
export async function updateCharacterAction(id, data) {
    const { user } = await requireAuth();
    const validationResult = characterUpdateSchema.safeParse(data);
    if (!validationResult.success) {
        throw new Error(`Validation failed: ${validationResult.error.issues.map(i => i.message).join(", ")}`);
    }
    const character = await characterRepository.update(id, validationResult.data, user.id);
    if (!character) {
        throw new Error("Character not found or not authorized");
    }
    revalidatePath(`/characters/${id}`);
    revalidatePath("/library/characters");
    return character;
}
export async function deleteCharacterAction(id) {
    const { user } = await requireAuth();
    await characterRepository.delete(id, user.id);
    revalidatePath("/library/characters");
    redirect("/library/characters");
}
