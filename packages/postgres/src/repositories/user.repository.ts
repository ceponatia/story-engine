import { getDatabase } from "../pool";

/**
 * User Repository
 *
 * Handles all database operations for User entities.
 * Implements Repository pattern for clean separation of concerns.
 * Supports multi-database architecture through adapter pattern.
 *
 * NOTE: Uses 'user' table (not 'users') for Better Auth compatibility.
 */

export interface IUserRepository {
  getById(id: string): Promise<{
    id: string;
    email: string;
    name: string | null;
    email_verified: Date | null;
    image: string | null;
  } | null>;
}

export class UserRepository implements IUserRepository {
  async getById(id: string): Promise<{
    id: string;
    email: string;
    name: string | null;
    email_verified: Date | null;
    image: string | null;
  } | null> {
    const db = getDatabase();
    const result = await db.query(
      'SELECT id, email, name, email_verified, image FROM "user" WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }
}

// Export repository instance
export const userRepository = new UserRepository();

// Note: Individual function exports removed to reduce code duplication.
// Use userRepository.methodName() instead.
