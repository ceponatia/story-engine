"use server";

import { getCurrentUser } from "@/lib/auth-helper";

export async function getCurrentUserAction() {
  return await getCurrentUser();
}