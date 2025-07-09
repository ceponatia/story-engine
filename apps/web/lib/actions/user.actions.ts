/**
 * User Actions
 * Basic user operations for the Story Engine
 */

import { getDatabase } from "@story-engine/postgres";

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const db = getDatabase();
    const result = await db.query(
      'SELECT id, email, name, created_at, updated_at FROM "user" WHERE id = $1',
      [userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export async function updateUser(userId: string, data: Partial<User>): Promise<User | null> {
  try {
    const db = getDatabase();
    const { name, email } = data;

    const result = await db.query(
      'UPDATE "user" SET name = COALESCE($2, name), email = COALESCE($3, email), updated_at = NOW() WHERE id = $1 RETURNING id, email, name, created_at, updated_at',
      [userId, name, email]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}

export async function getCurrentUserAction(): Promise<User | null> {
  try {
    // Import auth dynamically to avoid circular dependencies
    const { auth } = await import("@/lib/auth");
    const { headers } = await import("next/headers");
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionData?.user?.id) {
      return null;
    }

    // Get full user details from database
    return await getUserById(sessionData.user.id);
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
