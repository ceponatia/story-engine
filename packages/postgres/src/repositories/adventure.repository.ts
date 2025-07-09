import { getDatabase } from "../pool";
import { Adventure, Persona, AdventureCharacter, AdventureMessage } from "@story-engine/types";
import { PoolClient } from "pg";

/**
 * Adventure Repository
 *
 * Handles all database operations for Adventure entities and related sub-entities
 * (AdventureCharacter, AdventureMessage). Implements Repository pattern with
 * performance optimizations to eliminate N+1 query patterns.
 */

export interface AdventureRepository {
  getByUser(
    userId: string
  ): Promise<(Adventure & { character_name?: string; location_name?: string })[]>;
  getById(
    id: string,
    userId: string
  ): Promise<(Adventure & { adventure_characters: Array<{ name: string }> }) | null>;
  getWithPersona(
    adventureId: string,
    userId: string
  ): Promise<(Adventure & { persona?: Persona }) | null>;
  create(
    title: string,
    characterId: string,
    locationId: string | null,
    settingId: string | null,
    userId: string,
    userName?: string,
    adventureType?: string,
    personaId?: string | null,
    client?: PoolClient
  ): Promise<Adventure>;
  updateSystemPrompt(adventureId: string, systemPrompt: string, client?: PoolClient): Promise<void>;
}

export class AdventureRepository implements AdventureRepository {
  async getByUser(
    userId: string
  ): Promise<(Adventure & { character_name?: string; location_name?: string })[]> {
    const db = getDatabase();
    // Performance optimization: Use JOIN with JSON aggregation to eliminate N+1 pattern
    const result = await db.query(
      `SELECT a.*, 
       (SELECT name FROM adventure_characters ac WHERE ac.adventure_id = a.id LIMIT 1) as character_name
       FROM adventures a
       WHERE a.created_by = $1 
       ORDER BY a.created_at DESC`,
      [userId]
    );

    return result.rows.map((row) => ({
      ...row,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at ? row.updated_at.toISOString() : row.created_at.toISOString(),
    }));
  }

  async getById(
    id: string,
    userId: string
  ): Promise<(Adventure & { adventure_characters: Array<{ name: string }> }) | null> {
    const db = getDatabase();

    // Performance optimization: Single query with JSON aggregation to eliminate N+1 pattern
    const result = await db.query(
      `SELECT 
         a.*,
         (
           SELECT COALESCE(json_agg(json_build_object('name', ac.name)), '[]'::json)
           FROM adventure_characters ac
           WHERE ac.adventure_id = a.id
         ) as adventure_characters
       FROM adventures a
       WHERE a.id = $1 AND a.created_by = $2`,
      [id, userId]
    );

    if (!result.rows[0]) return null;

    const adventure = result.rows[0];
    return {
      ...adventure,
      created_at: adventure.created_at.toISOString(),
      updated_at: adventure.updated_at
        ? adventure.updated_at.toISOString()
        : adventure.created_at.toISOString(),
      adventure_characters: adventure.adventure_characters || [],
    };
  }

  async getWithPersona(
    adventureId: string,
    userId: string
  ): Promise<(Adventure & { persona?: Persona }) | null> {
    const db = getDatabase();
    try {
      const result = await db.query(
        `SELECT a.*, p.name as persona_name, p.age as persona_age, p.gender as persona_gender
         FROM adventures a
         LEFT JOIN personas p ON a.persona_id = p.id
         WHERE a.id = $1 AND a.created_by = $2`,
        [adventureId, userId]
      );

      if (!result.rows[0]) return null;

      const adventure = result.rows[0];

      const adventureWithPersona: Adventure & { persona?: Persona } = {
        id: adventure.id,
        name: adventure.name,
        title: adventure.title,
        type: adventure.type,
        character_id: adventure.character_id,
        setting_id: adventure.setting_id,
        location_id: adventure.location_id,
        persona_id: adventure.persona_id,
        status: adventure.status,
        system_prompt: adventure.system_prompt,
        created_by: adventure.created_by,
        created_at: adventure.created_at.toISOString(),
        updated_at: adventure.updated_at
          ? adventure.updated_at.toISOString()
          : adventure.created_at.toISOString(),
      };

      // Add persona if it exists
      if (adventure.persona_id && adventure.persona_name) {
        adventureWithPersona.persona = {
          id: adventure.persona_id,
          name: adventure.persona_name,
          age: adventure.persona_age,
          gender: adventure.persona_gender,
          is_private: true, // Default value
          created_by: userId,
          created_at: new Date(), // Placeholder
          updated_at: new Date(), // Placeholder
        };
      }

      return adventureWithPersona;
    } catch (error: any) {
      if (error.code === "42P01") {
        console.warn("Personas table does not exist yet.");
        // Return adventure without persona if personas table doesn't exist
        const result = await db.query(
          "SELECT * FROM adventures WHERE id = $1 AND created_by = $2",
          [adventureId, userId]
        );

        if (!result.rows[0]) return null;

        const adventure = result.rows[0];
        return {
          ...adventure,
          created_at: adventure.created_at.toISOString(),
          updated_at: adventure.updated_at
            ? adventure.updated_at.toISOString()
            : adventure.created_at.toISOString(),
        };
      }
      throw error;
    }
  }

  async create(
    title: string,
    characterId: string,
    locationId: string | null,
    settingId: string | null,
    userId: string,
    userName?: string,
    adventureType?: string,
    personaId?: string | null,
    client?: PoolClient
  ): Promise<Adventure> {
    const db = client || getDatabase();

    const result = await db.query(
      `INSERT INTO adventures (id, title, name, type, character_id, location_id, setting_id, persona_id, created_by)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title,
        userName || "Player",
        adventureType || "general",
        characterId,
        locationId,
        settingId,
        personaId,
        userId,
      ]
    );

    return {
      ...result.rows[0],
      created_at: result.rows[0].created_at.toISOString(),
      updated_at: result.rows[0].updated_at.toISOString(),
    };
  }

  async updateSystemPrompt(
    adventureId: string,
    systemPrompt: string,
    client?: PoolClient
  ): Promise<void> {
    const db = client || getDatabase();
    await db.query("UPDATE adventures SET system_prompt = $1, updated_at = NOW() WHERE id = $2", [
      systemPrompt,
      adventureId,
    ]);
  }
}

// Export default implementation
export const adventureRepository = new AdventureRepository();

// Note: Individual function exports removed to reduce code duplication.
// Use adventureRepository.methodName() instead.
