"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { 
  getLocationsByUser, 
  getLocationById, 
  createLocation, 
  updateLocation, 
  deleteLocation 
} from "@/lib/database/queries";
import { requireAuth } from "@/lib/auth-helper";
import { LocationFormData } from "@/lib/database/types";

export async function getLocationsAction() {
  const { user } = await requireAuth();
  return await getLocationsByUser(user.id);
}

export async function getLocationAction(id: string) {
  const { user } = await requireAuth();
  return await getLocationById(id, user.id);
}

export async function createLocationAction(data: LocationFormData) {
  const { user } = await requireAuth();
  
  const location = await createLocation(data, user.id);
  revalidatePath("/library/locations");
  redirect(`/locations/${location.id}`);
}

export async function updateLocationAction(id: string, data: LocationFormData) {
  const { user } = await requireAuth();
  
  const location = await updateLocation(id, data, user.id);
  if (!location) {
    throw new Error("Location not found or not authorized");
  }
  
  revalidatePath(`/locations/${id}`);
  revalidatePath("/library/locations");
  return location;
}

export async function deleteLocationAction(id: string) {
  const { user } = await requireAuth();
  
  await deleteLocation(id, user.id);
  revalidatePath("/library/locations");
  redirect("/library/locations");
}