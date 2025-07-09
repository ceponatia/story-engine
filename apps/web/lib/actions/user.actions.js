import { getDatabase } from "@story-engine/postgres";
export async function getUserById(userId) {
    try {
        const db = getDatabase();
        const result = await db.query('SELECT id, email, name, created_at, updated_at FROM "user" WHERE id = $1', [userId]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error("Error getting user by ID:", error);
        return null;
    }
}
export async function updateUser(userId, data) {
    try {
        const db = getDatabase();
        const { name, email } = data;
        const result = await db.query('UPDATE "user" SET name = COALESCE($2, name), email = COALESCE($3, email), updated_at = NOW() WHERE id = $1 RETURNING id, email, name, created_at, updated_at', [userId, name, email]);
        return result.rows[0] || null;
    }
    catch (error) {
        console.error("Error updating user:", error);
        return null;
    }
}
export async function getCurrentUserAction() {
    var _a;
    try {
        const { auth } = await import("@/lib/auth");
        const { headers } = await import("next/headers");
        const sessionData = await auth.api.getSession({
            headers: await headers(),
        });
        if (!((_a = sessionData === null || sessionData === void 0 ? void 0 : sessionData.user) === null || _a === void 0 ? void 0 : _a.id)) {
            return null;
        }
        return await getUserById(sessionData.user.id);
    }
    catch (error) {
        console.error("Error getting current user:", error);
        return null;
    }
}
