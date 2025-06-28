"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  getCharactersByUser, 
  getCharacterById, 
  createCharacter, 
  updateCharacter, 
  deleteCharacter 
} from "@/lib/database/queries";
import { requireAuth } from "@/lib/auth-helper";
import { CharacterFormData } from "@/lib/database/types";

export async function getCharactersAction() {
  const { user } = await requireAuth();
  return await getCharactersByUser(user.id);
}

export async function getCharacterAction(id: string) {
  const { user } = await requireAuth();
  return await getCharacterById(id, user.id);
}

export async function createCharacterAction(data: CharacterFormData) {
  const { user } = await requireAuth();
  
  const character = await createCharacter(data, user.id);
  revalidatePath("/library/characters");
  redirect(`/characters/${character.id}`);
}

export async function updateCharacterAction(id: string, data: CharacterFormData) {
  const { user } = await requireAuth();
  
  const character = await updateCharacter(id, data, user.id);
  if (!character) {
    throw new Error("Character not found or not authorized");
  }
  
  revalidatePath(`/characters/${id}`);
  revalidatePath("/library/characters");
  return character;
}

export async function deleteCharacterAction(id: string) {
  const { user } = await requireAuth();
  
  await deleteCharacter(id, user.id);
  revalidatePath("/library/characters");
  redirect("/library/characters");
}