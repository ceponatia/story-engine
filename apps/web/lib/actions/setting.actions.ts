"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MongoSettingRepository } from "@/lib/mongodb/setting.repository";
import { requireAuth } from "@/lib/auth-helper";
import { SettingFormData } from "@/lib/postgres/types";

// Create MongoDB repository instance
const settingRepository = new MongoSettingRepository();

export async function getSettingsAction() {
  const { user } = await requireAuth();

  return await settingRepository.getByUser(user.id);
}

export async function getSettingAction(id: string) {
  const { user } = await requireAuth();
  return await settingRepository.getById(id, user.id);
}

export async function createSettingAction(data: SettingFormData) {
  const { user } = await requireAuth();

  const setting = await settingRepository.create(data, user.id);
  revalidatePath("/library/settings");
  redirect(`/settings/${setting.id}`);
}

export async function updateSettingAction(id: string, data: SettingFormData) {
  const { user } = await requireAuth();

  const setting = await settingRepository.update(id, data, user.id);
  if (!setting) {
    throw new Error("Setting not found or not authorized");
  }

  revalidatePath(`/settings/${id}`);
  revalidatePath("/library/settings");
  return setting;
}

export async function deleteSettingAction(id: string) {
  const { user } = await requireAuth();

  await settingRepository.delete(id, user.id);
  revalidatePath("/library/settings");
  redirect("/library/settings");
}
