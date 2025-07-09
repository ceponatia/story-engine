"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { personaRepository } from "@story-engine/postgres";
import { requireAuth } from "@story-engine/auth";
import type { PersonaFormData } from "@story-engine/types";

export async function getPersonasAction() {
  const { user } = await requireAuth();
  return await personaRepository.getByUser(user.id);
}

export async function getPersonaAction(id: string) {
  const { user } = await requireAuth();
  return await personaRepository.getById(id, user.id);
}

export async function createPersonaAction(data: PersonaFormData) {
  const { user } = await requireAuth();

  const persona = await personaRepository.create(data, user.id);
  revalidatePath("/dashboard");
  return persona;
}

export async function updatePersonaAction(id: string, data: PersonaFormData) {
  const { user } = await requireAuth();

  const persona = await personaRepository.update(id, data, user.id);
  if (!persona) {
    throw new Error("Persona not found or not authorized");
  }

  revalidatePath("/dashboard");
  return persona;
}

export async function deletePersonaAction(id: string) {
  const { user } = await requireAuth();

  await personaRepository.delete(id, user.id);
  revalidatePath("/dashboard");
}
