// Database type definitions based on schema.sql

import { UnifiedParserResult } from '@/lib/parsers/unified-parser';

export interface User {
  id: string
  email: string
  email_verified?: Date
  name?: string
  image?: string
  created_at: Date
  updated_at: Date
}

export interface Character {
  id: string
  name: string
  private: boolean
  user_id: string
  created_at: string
  updated_at: string
  age: number
  gender: string
  appearance: UnifiedParserResult // JSONB - namespaced appearance data like {"hair.color": ["brown"], "body.size": ["petite"]}
  scents_aromas: UnifiedParserResult // JSONB - namespaced scent data like {"feet.aroma": ["smelly", "stinky"], "body.fragrance": ["vanilla"]}
  personality: UnifiedParserResult // JSONB - namespaced personality data like {"personality.traits": ["shy", "kind"], "personality.fears": ["spiders"]}
  background: string
  avatar_url?: string
  last_copied_at?: string
}

export interface Setting {
  id: string
  name: string
  description?: string
  world_type?: string
  history?: string
  tags?: string[]
  plot?: string
  private: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  description: string
  notable_features?: string[]
  connected_locations?: string[]
  tags?: string[]
  private: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface Adventure {
  id: string
  name: string // User's name from form
  title: string // Adventure title
  character_id?: string // Single character UUID
  setting_id?: string // Single setting UUID
  location_id?: string // Single location UUID
  status: 'active' | 'paused' | 'completed'
  system_prompt?: string
  created_by: string // Renamed from user_id
  created_at: string // ISO string for frontend compatibility
  updated_at?: string // ISO string for frontend compatibility
}

export interface AdventureCharacter {
  id: string
  adventure_id: string
  original_character_id?: string
  name: string
  age?: number
  gender?: string
  tags?: string[]
  appearance: UnifiedParserResult // JSONB - namespaced appearance data
  scents_aromas: UnifiedParserResult // JSONB - namespaced scent data  
  personality: UnifiedParserResult // JSONB - namespaced personality data
  background?: string
  avatar_url?: string
  state_updates: Record<string, unknown>
  user_id: string
  created_at: Date
  updated_at: Date
}

export interface AdventureMessage {
  id: string
  adventure_id: string
  message_type: 'dialogue' | 'action' | 'narration' | 'system' // Database uses message_type not role
  content: string
  metadata?: Record<string, unknown>
  speaker_id?: string // Database uses speaker_id to reference speakers table
  user_id?: string // Also available for backward compatibility
  created_at: string // ISO string for frontend compatibility
}

// Form data types
export interface CharacterFormData {
  name: string
  age: number
  gender: string
  tags?: string
  appearance: string // Natural language input that gets parsed to UnifiedParserResult
  scents_aromas?: string // Natural language input that gets parsed to UnifiedParserResult
  personality: string // Natural language input that gets parsed to UnifiedParserResult
  background: string
  avatar_url?: string
}

export interface SettingFormData {
  name: string
  description?: string
  world_type?: string
  history?: string
  tags?: string
}

export interface LocationFormData {
  name: string
  description: string
  notable_features?: string
  connected_locations?: string
  tags?: string
}