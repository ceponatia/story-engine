import { getDatabase } from "../pool";
import { AdventureMessage } from "@story-engine/types";
import { PoolClient } from "pg";

/**
 * Adventure Message Repository
 *
 * Handles all database operations for Adventure Message entities.
 * Implements Repository pattern for clean separation of concerns.
 * Supports multi-database architecture through adapter pattern.
 *
 * NOTE: Schema uses 'role' field, not 'message_type' as in types.
 * This repository uses the actual schema field names.
 */

export interface AdventureMessageRepository {
  getByAdventure(adventureId: string, limit?: number): Promise<AdventureMessage[]>;
  create(
    adventureId: string,
    role: "user" | "assistant" | "system",
    content: string,
    userId: string,
    metadata?: Record<string, unknown>,
    client?: PoolClient
  ): Promise<AdventureMessage>;
  update(
    messageId: string,
    content: string,
    userId: string,
    client?: PoolClient
  ): Promise<AdventureMessage>;
  delete(messageId: string, userId: string, client?: PoolClient): Promise<void>;
}

export class AdventureMessageRepository implements AdventureMessageRepository {
  async getByAdventure(adventureId: string, limit: number = 50): Promise<AdventureMessage[]> {
    const db = getDatabase();
    const result = await db.query(
      "SELECT * FROM adventure_messages WHERE adventure_id = $1 ORDER BY created_at ASC LIMIT $2",
      [adventureId, limit]
    );

    // Convert created_at Date to string for frontend compatibility
    return result.rows.map((row) => ({
      ...row,
      // Map schema 'role' field to types 'message_type' for compatibility
      message_type: row.role,
      created_at: row.created_at.toISOString(),
    }));
  }

  async create(
    adventureId: string,
    role: "user" | "assistant" | "system",
    content: string,
    userId: string,
    metadata: Record<string, unknown> = {},
    client?: PoolClient
  ): Promise<AdventureMessage> {
    const dbClient = client || getDatabase();

    const result = await dbClient.query(
      `INSERT INTO adventure_messages (id, adventure_id, role, content, user_id, metadata)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
       RETURNING *`,
      [adventureId, role, content, userId, JSON.stringify(metadata)]
    );

    const message = result.rows[0];
    return {
      ...message,
      // Map schema 'role' field to types 'message_type' for compatibility
      message_type: message.role,
      created_at: message.created_at.toISOString(),
    };
  }

  async update(
    messageId: string,
    content: string,
    userId: string,
    client?: PoolClient
  ): Promise<AdventureMessage> {
    const dbClient = client || getDatabase();

    const result = await dbClient.query(
      `UPDATE adventure_messages 
       SET content = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [content, messageId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Message not found or not accessible");
    }

    const message = result.rows[0];
    return {
      ...message,
      // Map schema 'role' field to types 'message_type' for compatibility
      message_type: message.role,
      created_at: message.created_at.toISOString(),
    };
  }

  async delete(messageId: string, userId: string, client?: PoolClient): Promise<void> {
    const dbClient = client || getDatabase();

    const result = await dbClient.query(
      `DELETE FROM adventure_messages 
       WHERE id = $1 AND user_id = $2`,
      [messageId, userId]
    );

    if (result.rowCount === 0) {
      throw new Error("Message not found or not accessible");
    }
  }
}

// Export repository instance
export const adventureMessageRepository = new AdventureMessageRepository();

// Note: Individual function exports removed to reduce code duplication.
// Use adventureMessageRepository.methodName() instead.
