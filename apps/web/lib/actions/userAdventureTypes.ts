"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getUserAdventureTypes,
  createUserAdventureType,
  updateUserAdventureType,
  deleteUserAdventureType,
  getPublicAdventureTypes,
} from "@story-engine/postgres";
import { requireAuth } from "@story-engine/auth";
import type { UserAdventureTypeFormData } from "@story-engine/types";

export async function createAdventureType(formData: FormData) {
  const { user } = await requireAuth();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const is_public = formData.get("is_public") === "true";
  const template_content = formData.get("template_content") as string;

  if (!name || !template_content) {
    throw new Error("Name and template content are required");
  }

  // Validate template content has basic required placeholders
  if (!template_content.includes("{{character.name}}")) {
    throw new Error("Template must include {{character.name}} placeholder");
  }

  try {
    const data: UserAdventureTypeFormData = {
      name: name.toLowerCase().replace(/\s+/g, "_"), // Convert to snake_case
      description: description || undefined,
      is_public,
      template_content,
    };

    const adventureType = await createUserAdventureType(data, user.id);

    revalidatePath("/adventure-types");
    redirect(`/adventure-types/${adventureType.id}`);
  } catch (error) {
    console.error("Error creating adventure type:", error);
    if (error instanceof Error && error.message.includes("duplicate key")) {
      throw new Error("An adventure type with this name already exists");
    }
    throw error;
  }
}

export async function updateAdventureType(formData: FormData) {
  const { user } = await requireAuth();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const is_public = formData.get("is_public") === "true";
  const template_content = formData.get("template_content") as string;

  if (!id || !name || !template_content) {
    throw new Error("ID, name, and template content are required");
  }

  // Validate template content has basic required placeholders
  if (!template_content.includes("{{character.name}}")) {
    throw new Error("Template must include {{character.name}} placeholder");
  }

  try {
    const data: Partial<UserAdventureTypeFormData> = {
      name: name.toLowerCase().replace(/\s+/g, "_"),
      description: description || undefined,
      is_public,
      template_content,
    };

    const updatedType = await updateUserAdventureType(id, data, user.id);

    if (!updatedType) {
      throw new Error("Adventure type not found or not accessible");
    }

    revalidatePath("/adventure-types");
    revalidatePath(`/adventure-types/${id}`);
    return { success: true, adventureType: updatedType };
  } catch (error) {
    console.error("Error updating adventure type:", error);
    throw error;
  }
}

export async function deleteAdventureType(formData: FormData) {
  const { user } = await requireAuth();

  const id = formData.get("id") as string;

  if (!id) {
    throw new Error("Adventure type ID is required");
  }

  try {
    const deleted = await deleteUserAdventureType(id, user.id);

    if (!deleted) {
      throw new Error("Adventure type not found or not accessible");
    }

    revalidatePath("/adventure-types");
    redirect("/adventure-types");
  } catch (error) {
    console.error("Error deleting adventure type:", error);
    throw error;
  }
}

export async function getUserAdventureTypesList(userId: string) {
  try {
    return await getUserAdventureTypes(userId);
  } catch (error) {
    console.error("Error fetching user adventure types:", error);
    throw error;
  }
}

export async function getPublicAdventureTypesList() {
  try {
    return await getPublicAdventureTypes(50);
  } catch (error) {
    console.error("Error fetching public adventure types:", error);
    throw error;
  }
}
