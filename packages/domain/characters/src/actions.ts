"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MongoCharacterRepository } from "@/lib/mongodb/character.repository";
import { requireAuth } from "@/lib/auth-helper";
import { CharacterFormData } from "@/lib/postgres/types";

// Create MongoDB repository instance
const characterRepository = new MongoCharacterRepository();

export async function getCharactersAction() {
  const { user } = await requireAuth();
  return await characterRepository.getByUser(user.id);
}

export async function getCharacterAction(id: string) {
  const { user } = await requireAuth();
  return await characterRepository.getById(id, user.id);
}

export async function createCharacterAction(data: CharacterFormData) {
  const { user } = await requireAuth();

  const character = await characterRepository.create(data, user.id);
  revalidatePath("/library/characters");
  redirect(`/characters/${character.id}`);
}

export async function updateCharacterAction(id: string, data: CharacterFormData) {
  const { user } = await requireAuth();

  const character = await characterRepository.update(id, data, user.id);
  if (!character) {
    throw new Error("Character not found or not authorized");
  }

  revalidatePath(`/characters/${id}`);
  revalidatePath("/library/characters");
  return character;
}

export async function deleteCharacterAction(id: string) {
  const { user } = await requireAuth();

  await characterRepository.delete(id, user.id);
  revalidatePath("/library/characters");
  redirect("/library/characters");
}
