import { getDatabase } from "../pool";
import { AdventureCharacter } from "@story-engine/types";
import { PoolClient } from "pg";

/**
 * Adventure Character Repository
 *
 * Handles all database operations for AdventureCharacter entities.
 * Manages character instances within specific adventures, including state evolution.
 */

export interface AdventureCharacterRepository {
  create(
    adventureId: string,
    originalCharacterId: string,
    characterData: {
      name: string;
      age?: number;
      gender?: string;
      appearance?: any;
      scents_aromas?: any;
      personality?: any;
      background?: string;
      avatar_url?: string;
    },
    userId: string,
    client?: PoolClient
  ): Promise<AdventureCharacter>;
  getByAdventure(adventureId: string, userId?: string): Promise<AdventureCharacter | null>;
  getState(adventureId: string, userId: string): Promise<Record<string, unknown>>;
  updateState(
    adventureId: string,
    stateUpdates: Record<string, unknown>,
    userId: string,
    client?: PoolClient
  ): Promise<void>;
}

export class AdventureCharacterRepository implements AdventureCharacterRepository {
  async create(
    adventureId: string,
    originalCharacterId: string,
    characterData: {
      name: string;
      age?: number;
      gender?: string;
      appearance?: any;
      scents_aromas?: any;
      personality?: any;
      background?: string;
      avatar_url?: string;
    },
    userId: string,
    client?: PoolClient
  ): Promise<AdventureCharacter> {
    const db = client || getDatabase();

    const result = await db.query(
      `INSERT INTO adventure_characters (
        id, adventure_id, original_character_id, name, age, gender,
        appearance, scents_aromas, personality, background, avatar_url, user_id
      ) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        adventureId,
        originalCharacterId,
        characterData.name,
        characterData.age || null,
        characterData.gender || "",
        characterData.appearance || {},
        characterData.scents_aromas || {},
        characterData.personality || {},
        characterData.background || "",
        characterData.avatar_url || null,
        userId,
      ]
    );
    return result.rows[0];
  }

  async getByAdventure(adventureId: string, userId?: string): Promise<AdventureCharacter | null> {
    const db = getDatabase();
    const query = userId
      ? "SELECT * FROM adventure_characters WHERE adventure_id = $1 AND user_id = $2 LIMIT 1"
      : "SELECT * FROM adventure_characters WHERE adventure_id = $1 LIMIT 1";
    const params = userId ? [adventureId, userId] : [adventureId];

    const result = await db.query(query, params);
    const character = result.rows[0];

    if (!character) return null;

    return {
      ...character,
      created_at: character.created_at.toISOString(),
      updated_at: character.updated_at.toISOString(),
    };
  }

  async getState(adventureId: string, userId: string): Promise<Record<string, unknown>> {
    const db = getDatabase();
    const result = await db.query(
      "SELECT state_updates FROM adventure_characters WHERE adventure_id = $1 AND user_id = $2",
      [adventureId, userId]
    );
    return result.rows[0]?.state_updates || {};
  }

  async updateState(
    adventureId: string,
    stateUpdates: Record<string, unknown>,
    userId: string,
    client?: PoolClient
  ): Promise<void> {
    const db = client || getDatabase();
    await db.query(
      "UPDATE adventure_characters SET state_updates = $1, updated_at = NOW() WHERE adventure_id = $2 AND user_id = $3",
      [stateUpdates, adventureId, userId] // Pass object directly - node-postgres handles JSONB conversion
    );
  }
}

// Export default implementation
export const adventureCharacterRepository = new AdventureCharacterRepository();

// Note: Individual function exports removed to reduce code duplication.
// Use adventureCharacterRepository.methodName() instead.
