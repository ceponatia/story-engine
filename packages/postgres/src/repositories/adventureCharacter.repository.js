import { getDatabase } from "../pool";
export class AdventureCharacterRepository {
    async create(adventureId, originalCharacterId, characterData, userId, client) {
        const db = client || getDatabase();
        const result = await db.query(`INSERT INTO adventure_characters (
        id, adventure_id, original_character_id, name, age, gender,
        appearance, scents_aromas, personality, background, avatar_url, user_id
      ) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`, [
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
        ]);
        return result.rows[0];
    }
    async getByAdventure(adventureId, userId) {
        const db = getDatabase();
        const query = userId
            ? "SELECT * FROM adventure_characters WHERE adventure_id = $1 AND user_id = $2 LIMIT 1"
            : "SELECT * FROM adventure_characters WHERE adventure_id = $1 LIMIT 1";
        const params = userId ? [adventureId, userId] : [adventureId];
        const result = await db.query(query, params);
        const character = result.rows[0];
        if (!character)
            return null;
        return Object.assign(Object.assign({}, character), { created_at: character.created_at.toISOString(), updated_at: character.updated_at.toISOString() });
    }
    async getState(adventureId, userId) {
        var _a;
        const db = getDatabase();
        const result = await db.query("SELECT state_updates FROM adventure_characters WHERE adventure_id = $1 AND user_id = $2", [adventureId, userId]);
        return ((_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.state_updates) || {};
    }
    async updateState(adventureId, stateUpdates, userId, client) {
        const db = client || getDatabase();
        await db.query("UPDATE adventure_characters SET state_updates = $1, updated_at = NOW() WHERE adventure_id = $2 AND user_id = $3", [stateUpdates, adventureId, userId]);
    }
}
export const adventureCharacterRepository = new AdventureCharacterRepository();
