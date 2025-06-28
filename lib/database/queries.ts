import getDatabase from './pool'
import { 
  Character, 
  Setting, 
  Location, 
  Adventure, 
  AdventureCharacter, 
  AdventureMessage,
  CharacterFormData,
  SettingFormData,
  LocationFormData
} from './types'
// Static imports to replace dynamic imports for performance
import { parseAppearanceText, parsePersonalityText, parseScentsText } from '@/lib/parsers/unified-parser'
import { parseTagsFromString } from '@/lib/utils'

// Utility function to convert array strings to arrays
function parseArrayField(value: string | string[] | null | undefined): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  if (typeof value !== 'string') return []
  if (value.startsWith('{') && value.endsWith('}')) {
    return value.slice(1, -1).split(',').filter(Boolean)
  }
  return value.split(',').filter(Boolean)
}

// =============================================================================
// CHARACTER QUERIES
// =============================================================================

export async function getCharactersByUser(userId: string): Promise<Character[]> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM characters WHERE created_by = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows.map(row => ({
    ...row,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString()
  }))
}

export async function getCharacterById(id: string, userId: string): Promise<Character | null> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM characters WHERE id = $1 AND created_by = $2',
    [id, userId]
  )
  
  if (!result.rows[0]) {
    return null
  }
  
  const character = result.rows[0]
  
  // Get tags for this character
  const tags = await getCharacterTags(character.id)
  
  return {
    ...character,
    tags: tags.join(', ') // Convert tags array to comma-separated string for form compatibility
  }
}

// Tag management functions - simplified to work with array field
export async function updateCharacterTags(characterId: string, tagNames: string[]): Promise<void> {
  const db = getDatabase()
  
  // Update the tags array directly
  await db.query(
    'UPDATE characters SET tags = $1, updated_at = NOW() WHERE id = $2',
    [tagNames, characterId]
  )
}

export async function getCharacterTags(characterId: string): Promise<string[]> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT tags FROM characters WHERE id = $1',
    [characterId]
  )
  const tags = result.rows[0]?.tags
  return tags || []
}

export async function createCharacter(data: CharacterFormData, userId: string): Promise<Character> {
  const db = getDatabase()
  
  // Use static imports for better performance (no circular dependencies found)
  
  // Parse appearance into structured JSONB with namespaced keys
  const parsedAppearance = data.appearance ? parseAppearanceText(data.appearance) : {}
  
  // Parse personality into structured JSONB with namespaced keys
  const parsedPersonality = data.personality ? parsePersonalityText(data.personality) : {}
  
  // Parse scents & fragrances into structured JSONB with namespaced keys
  const parsedScents = data.scents_aromas ? parseScentsText(data.scents_aromas) : {}
  
  // Handle tags if provided
  const tagNames = data.tags ? parseTagsFromString(data.tags) : []
  
  const result = await db.query(
    `INSERT INTO characters (
      id, name, age, gender, appearance, scents_aromas, 
      personality, background, avatar_url, tags, created_by
    ) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      data.name,
      data.age,
      data.gender,
      JSON.stringify(parsedAppearance), // Store parsed JSONB in appearance field
      JSON.stringify(parsedScents), // Store parsed JSONB in scents_aromas field
      JSON.stringify(parsedPersonality), // Store parsed JSONB in personality field
      data.background,
      data.avatar_url || null,
      tagNames, // Store tags as array directly
      userId
    ]
  )
  
  const character = result.rows[0]
  
  return {
    ...character,
    created_at: character.created_at.toISOString(),
    updated_at: character.updated_at.toISOString()
  }
}

export async function updateCharacter(id: string, data: CharacterFormData, userId: string): Promise<Character | null> {
  const db = getDatabase()
  
  // Use static imports for better performance (no circular dependencies found)
  
  // Parse appearance into structured JSONB with namespaced keys
  const parsedAppearance = data.appearance ? parseAppearanceText(data.appearance) : {}
  
  // Parse personality into structured JSONB with namespaced keys
  const parsedPersonality = data.personality ? parsePersonalityText(data.personality) : {}
  
  // Parse scents & fragrances into structured JSONB with namespaced keys
  const parsedScents = data.scents_aromas ? parseScentsText(data.scents_aromas) : {}
  
  // Handle tags if provided
  const tagNames = data.tags ? parseTagsFromString(data.tags) : []
  
  const result = await db.query(
    `UPDATE characters SET 
      name = $1, age = $2, gender = $3, appearance = $4, 
      scents_aromas = $5, personality = $6, background = $7, 
      avatar_url = $8, tags = $9, updated_at = NOW()
    WHERE id = $10 AND created_by = $11
    RETURNING *`,
    [
      data.name,
      data.age || null,
      data.gender || null,
      JSON.stringify(parsedAppearance),
      JSON.stringify(parsedScents),
      JSON.stringify(parsedPersonality),
      data.background || null,
      data.avatar_url || null,
      tagNames, // Store tags as array directly
      id,
      userId
    ]
  )
  
  const character = result.rows[0]
  
  if (!character) {
    return null
  }
  
  return {
    ...character,
    created_at: character.created_at.toISOString(),
    updated_at: character.updated_at.toISOString(),
    tags: character.tags ? character.tags.join(', ') : ''
  }
}

export async function deleteCharacter(id: string, userId: string): Promise<boolean> {
  const db = getDatabase()
  const result = await db.query(
    'DELETE FROM characters WHERE id = $1 AND created_by = $2',
    [id, userId]
  )
  return (result.rowCount ?? 0) > 0
}

// =============================================================================
// SETTING QUERIES
// =============================================================================

export async function getSettingsByUser(userId: string): Promise<Setting[]> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM settings WHERE created_by = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows.map(row => ({
    ...row,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString()
  }))
}

export async function getSettingById(id: string, userId: string): Promise<Setting | null> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM settings WHERE id = $1 AND created_by = $2',
    [id, userId]
  )
  return result.rows[0] || null
}

export async function createSetting(data: SettingFormData, userId: string): Promise<Setting> {
  const db = getDatabase()
  
  // Handle tags consistently with characters
  const tagNames = data.tags ? parseTagsFromString(data.tags) : []
  
  const result = await db.query(
    `INSERT INTO settings (
      id, name, description, world_type, history, tags, created_by
    ) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      data.name,
      data.description || null,
      data.world_type || null,
      data.history || null,
      tagNames,
      userId
    ]
  )
  
  const setting = result.rows[0]
  return {
    ...setting,
    created_at: setting.created_at.toISOString(),
    updated_at: setting.updated_at.toISOString(),
    tags: setting.tags ? setting.tags.join(', ') : ''
  }
}

export async function updateSetting(id: string, data: SettingFormData, userId: string): Promise<Setting | null> {
  const db = getDatabase()
  
  // Handle tags consistently with characters
  const tagNames = data.tags ? parseTagsFromString(data.tags) : []
  
  const result = await db.query(
    `UPDATE settings SET 
      name = $1, description = $2, world_type = $3, history = $4, tags = $5,
      updated_at = NOW()
    WHERE id = $6 AND created_by = $7
    RETURNING *`,
    [
      data.name,
      data.description || null,
      data.world_type || null,
      data.history || null,
      tagNames,
      id,
      userId
    ]
  )
  
  const setting = result.rows[0]
  if (!setting) return null
  
  return {
    ...setting,
    created_at: setting.created_at.toISOString(),
    updated_at: setting.updated_at.toISOString(),
    tags: setting.tags ? setting.tags.join(', ') : ''
  }
}

export async function deleteSetting(id: string, userId: string): Promise<boolean> {
  const db = getDatabase()
  const result = await db.query(
    'DELETE FROM settings WHERE id = $1 AND created_by = $2',
    [id, userId]
  )
  return (result.rowCount ?? 0) > 0
}

// =============================================================================
// LOCATION QUERIES
// =============================================================================

export async function getLocationsByUser(userId: string): Promise<Location[]> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM locations WHERE created_by = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows.map(row => ({
    ...row,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString()
  }))
}

export async function getLocationById(id: string, userId: string): Promise<Location | null> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM locations WHERE id = $1 AND created_by = $2',
    [id, userId]
  )
  return result.rows[0] || null
}

export async function createLocation(data: LocationFormData, userId: string): Promise<Location> {
  const db = getDatabase()
  
  // Handle tags as arrays (already in correct format in DB)
  const tagNames = data.tags ? parseTagsFromString(data.tags) : []
  const notable_features = data.notable_features ? parseArrayField(data.notable_features) : null
  const connected_locations = data.connected_locations ? parseArrayField(data.connected_locations) : null
  
  const result = await db.query(
    `INSERT INTO locations (
      id, name, description, notable_features, connected_locations, tags, created_by
    ) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      data.name,
      data.description || null,
      notable_features,
      connected_locations,
      tagNames,
      userId
    ]
  )
  
  const location = result.rows[0]
  return {
    ...location,
    created_at: location.created_at.toISOString(),
    updated_at: location.updated_at.toISOString(),
    tags: location.tags || []
  }
}

export async function updateLocation(id: string, data: LocationFormData, userId: string): Promise<Location | null> {
  const db = getDatabase()
  
  // Handle tags as arrays (already in correct format in DB)
  const tagNames = data.tags ? parseTagsFromString(data.tags) : []
  const notable_features = data.notable_features ? parseArrayField(data.notable_features) : null
  const connected_locations = data.connected_locations ? parseArrayField(data.connected_locations) : null
  
  const result = await db.query(
    `UPDATE locations SET 
      name = $1, description = $2, notable_features = $3,
      connected_locations = $4, tags = $5,
      updated_at = NOW()
    WHERE id = $6 AND created_by = $7
    RETURNING *`,
    [
      data.name,
      data.description || null,
      notable_features,
      connected_locations,
      tagNames,
      id,
      userId
    ]
  )
  
  const location = result.rows[0]
  if (!location) return null
  
  return {
    ...location,
    created_at: location.created_at.toISOString(),
    updated_at: location.updated_at.toISOString(),
    tags: location.tags || []
  }
}

export async function deleteLocation(id: string, userId: string): Promise<boolean> {
  const db = getDatabase()
  const result = await db.query(
    'DELETE FROM locations WHERE id = $1 AND created_by = $2',
    [id, userId]
  )
  return (result.rowCount ?? 0) > 0
}

// =============================================================================
// ADVENTURE QUERIES
// =============================================================================

export async function getAdventuresByUser(userId: string): Promise<(Adventure & { character_name?: string, location_name?: string })[]> {
  const db = getDatabase()
  const result = await db.query(
    `SELECT a.*, 
     CASE WHEN array_length(a.adventure_characters, 1) > 0 
          THEN (SELECT name FROM adventure_characters ac WHERE ac.adventure_id = a.id LIMIT 1)
          ELSE NULL 
     END as character_name
     FROM adventures a
     WHERE a.created_by = $1 
     ORDER BY a.created_at DESC`,
    [userId]
  )
  // Convert dates to strings for frontend compatibility
  return result.rows.map(row => ({
    ...row,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at ? row.updated_at.toISOString() : row.created_at.toISOString()
  }))
}

export async function getAdventureById(id: string, userId: string): Promise<(Adventure & { adventure_characters: Array<{ name: string }> }) | null> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM adventures WHERE id = $1 AND created_by = $2',
    [id, userId]
  )
  
  if (!result.rows[0]) return null
  
  // Get adventure characters
  const charactersResult = await db.query(
    'SELECT name FROM adventure_characters WHERE adventure_id = $1',
    [id]
  )
  
  const adventure = result.rows[0]
  if (!adventure) return null
  
  return {
    ...adventure,
    created_at: adventure.created_at.toISOString(),
    updated_at: adventure.updated_at ? adventure.updated_at.toISOString() : adventure.created_at.toISOString(),
    adventure_characters: charactersResult.rows || []
  }
}

export async function createAdventure(
  title: string,
  characterId: string,
  locationId: string | null,
  settingId: string | null,
  userId: string,
  userName?: string,
  adventureType?: string
): Promise<Adventure> {
  const db = getDatabase()
  
  const result = await db.query(
    `INSERT INTO adventures (id, title, name, character_id, location_id, setting_id, created_by)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      title,
      userName || 'Player',
      characterId,
      locationId,
      settingId,
      userId
    ]
  )
  
  return {
    ...result.rows[0],
    created_at: result.rows[0].created_at.toISOString(),
    updated_at: result.rows[0].updated_at.toISOString()
  }
}

export async function updateAdventureSystemPrompt(adventureId: string, systemPrompt: string): Promise<void> {
  const db = getDatabase()
  await db.query(
    'UPDATE adventures SET system_prompt = $1, updated_at = NOW() WHERE id = $2',
    [systemPrompt, adventureId]
  )
}

// =============================================================================
// ADVENTURE CHARACTER QUERIES
// =============================================================================

export async function createAdventureCharacter(
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
  userId: string
): Promise<AdventureCharacter> {
  const db = getDatabase()
  
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
      characterData.gender || '',
      characterData.appearance || {},
      characterData.scents_aromas || {},
      characterData.personality || {},
      characterData.background || '',
      characterData.avatar_url || null,
      userId
    ]
  )
  return result.rows[0]
}

export async function getAdventureCharacter(adventureId: string, userId?: string): Promise<AdventureCharacter | null> {
  const db = getDatabase()
  const query = userId 
    ? 'SELECT * FROM adventure_characters WHERE adventure_id = $1 AND user_id = $2 LIMIT 1'
    : 'SELECT * FROM adventure_characters WHERE adventure_id = $1 LIMIT 1'
  const params = userId ? [adventureId, userId] : [adventureId]
  
  const result = await db.query(query, params)
  const character = result.rows[0]
  
  if (!character) return null
  
  return {
    ...character,
    created_at: character.created_at.toISOString(),
    updated_at: character.updated_at.toISOString()
  }
}

export async function getAdventureCharacterState(adventureId: string, userId: string): Promise<Record<string, unknown>> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT state_updates FROM adventure_characters WHERE adventure_id = $1 AND user_id = $2',
    [adventureId, userId]
  )
  return result.rows[0]?.state_updates || {}
}

export async function updateAdventureCharacterState(
  adventureId: string,
  stateUpdates: Record<string, unknown>,
  userId: string
): Promise<void> {
  const db = getDatabase()
  await db.query(
    'UPDATE adventure_characters SET state_updates = $1, updated_at = NOW() WHERE adventure_id = $2 AND user_id = $3',
    [JSON.stringify(stateUpdates), adventureId, userId]
  )
}

// =============================================================================
// ADVENTURE MESSAGE QUERIES
// =============================================================================

export async function getAdventureMessages(adventureId: string, limit: number = 50): Promise<AdventureMessage[]> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT * FROM adventure_messages WHERE adventure_id = $1 ORDER BY created_at ASC LIMIT $2',
    [adventureId, limit]
  )
  // Convert created_at Date to string for frontend compatibility
  return result.rows.map(row => ({
    ...row,
    created_at: row.created_at.toISOString()
  }))
}

// Note: Speakers system removed - adventure_messages uses simple role field instead

export async function createAdventureMessage(
  adventureId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  userId: string,
  metadata: Record<string, unknown> = {}
): Promise<AdventureMessage> {
  const db = getDatabase()
  
  const result = await db.query(
    `INSERT INTO adventure_messages (id, adventure_id, role, content, user_id, metadata)
     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
     RETURNING *`,
    [adventureId, role, content, userId, JSON.stringify(metadata)]
  )
  
  // Convert created_at to ISO string for frontend compatibility
  return {
    ...result.rows[0],
    created_at: result.rows[0].created_at.toISOString()
  }
}

// =============================================================================
// USER QUERIES (Better Auth integration)
// =============================================================================

export async function getUserById(id: string): Promise<{ id: string; email: string; name: string | null; email_verified: Date | null; image: string | null } | null> {
  const db = getDatabase()
  const result = await db.query(
    'SELECT id, email, name, email_verified, image FROM "user" WHERE id = $1',
    [id]
  )
  return result.rows[0] || null
}

// Note: getCurrentUser is now handled by auth-helper.ts using Better Auth sessions
// This maintains backward compatibility but new code should use auth-helper.ts

