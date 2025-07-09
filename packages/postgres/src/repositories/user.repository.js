import { getDatabase } from "../pool";
export class UserRepository {
    async getById(id) {
        const db = getDatabase();
        const result = await db.query('SELECT id, email, name, email_verified, image FROM "user" WHERE id = $1', [id]);
        return result.rows[0] || null;
    }
}
export const userRepository = new UserRepository();
