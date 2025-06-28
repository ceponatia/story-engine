"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  getSettingsByUser, 
  getSettingById, 
  createSetting, 
  updateSetting, 
  deleteSetting 
} from "@/lib/database/queries";
import { requireAuth } from "@/lib/auth-helper";
import { SettingFormData } from "@/lib/database/types";

export async function getSettingsAction() {
  const { user } = await requireAuth();
  
  return await getSettingsByUser(user.id);
}

export async function getSettingAction(id: string) {
  const { user } = await requireAuth();
  return await getSettingById(id, user.id);
}

export async function createSettingAction(data: SettingFormData) {
  const { user } = await requireAuth();
  
  const setting = await createSetting(data, user.id);
  revalidatePath("/library/settings");
  redirect(`/settings/${setting.id}`);
}

export async function updateSettingAction(id: string, data: SettingFormData) {
  const { user } = await requireAuth();
  
  const setting = await updateSetting(id, data, user.id);
  if (!setting) {
    throw new Error("Setting not found or not authorized");
  }
  
  revalidatePath(`/settings/${id}`);
  revalidatePath("/library/settings");
  return setting;
}

export async function deleteSettingAction(id: string) {
  const { user } = await requireAuth();
  
  await deleteSetting(id, user.id);
  revalidatePath("/library/settings");
  redirect("/library/settings");
}