import { headers } from "next/headers";
import { auth } from "./auth";
import { getDatabase } from "@story-engine/postgres";

export async function getCurrentUser() {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });
    return sessionData?.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function getCurrentSession() {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });
    return sessionData?.session || null;
  } catch (error) {
    console.error("Error getting current session:", error);
    return null;
  }
}

export async function requireAuth() {
  const sessionData = await auth.api.getSession({
    headers: await headers(),
  });

  if (!sessionData?.user || !sessionData?.session) {
    throw new Error("Authentication required");
  }

  return {
    user: sessionData.user,
    session: sessionData.session,
  };
}

export async function getUserSession() {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionData?.user || !sessionData?.session) {
      return null;
    }

    // Get user details including role from database
    const userWithRole = await getUserById(sessionData.user.id);

    return {
      user: {
        ...sessionData.user,
        role: userWithRole?.role || "user",
      },
      session: sessionData.session,
    };
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

export async function requireAdminAuth() {
  const sessionData = await getUserSession();

  if (!sessionData?.user || !sessionData?.session) {
    throw new Error("Authentication required");
  }

  if (sessionData.user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return {
    user: sessionData.user,
    session: sessionData.session,
  };
}

export async function getUserById(id: string) {
  try {
    // For now, we'll use the database directly, but Better Auth handles user management
    // In production, you might want to extend Better Auth's user queries
    const db = getDatabase();
    const result = await db.query(
      'SELECT id, email, name, email_verified, image, created_at, updated_at, role FROM "user" WHERE id = $1',
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}
