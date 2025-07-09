"use server";
import { revalidatePath } from "next/cache";
import { personaRepository } from "@/lib/postgres/repositories";
import { requireAuth } from "@/lib/auth-helper";
export async function getPersonasAction() {
    const { user } = await requireAuth();
    return await personaRepository.getByUser(user.id);
}
export async function getPersonaAction(id) {
    const { user } = await requireAuth();
    return await personaRepository.getById(id, user.id);
}
export async function createPersonaAction(data) {
    const { user } = await requireAuth();
    const persona = await personaRepository.create(data, user.id);
    revalidatePath("/dashboard");
    return persona;
}
export async function updatePersonaAction(id, data) {
    const { user } = await requireAuth();
    const persona = await personaRepository.update(id, data, user.id);
    if (!persona) {
        throw new Error("Persona not found or not authorized");
    }
    revalidatePath("/dashboard");
    return persona;
}
export async function deletePersonaAction(id) {
    const { user } = await requireAuth();
    await personaRepository.delete(id, user.id);
    revalidatePath("/dashboard");
}
