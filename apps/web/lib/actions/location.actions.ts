"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MongoLocationRepository } from "@story-engine/mongodb";
import { requireAuth } from "@story-engine/auth";
import type { LocationFormData } from "@story-engine/types";

// Create MongoDB repository instance
const locationRepository = new MongoLocationRepository();

export async function getLocationsAction() {
  const { user } = await requireAuth();
  return await locationRepository.getByUser(user.id);
}

export async function getLocationAction(id: string) {
  const { user } = await requireAuth();
  return await locationRepository.getById(id, user.id);
}

export async function createLocationAction(data: LocationFormData) {
  const { user } = await requireAuth();

  const location = await locationRepository.create(data, user.id);
  revalidatePath("/library/locations");
  redirect(`/locations/${location.id}`);
}

export async function updateLocationAction(id: string, data: LocationFormData) {
  const { user } = await requireAuth();

  const location = await locationRepository.update(id, data, user.id);
  if (!location) {
    throw new Error("Location not found or not authorized");
  }

  revalidatePath(`/locations/${id}`);
  revalidatePath("/library/locations");
  return location;
}

export async function deleteLocationAction(id: string) {
  const { user } = await requireAuth();

  await locationRepository.delete(id, user.id);
  revalidatePath("/library/locations");
  redirect("/library/locations");
}
