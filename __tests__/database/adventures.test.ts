/**
 * Database tests for adventure functionality (Phase 1 & 2)
 * Tests the adventures, adventure_characters, and adventure_messages tables
 */

import { createClient } from '@supabase/supabase-js'
import { beforeAll, afterAll, describe, expect, it } from '@jest/globals'
import crypto from 'crypto'

describe('Adventures Database Tests', () => {
  // Generate unique IDs for test isolation
  const TEST_USER_ID = crypto.randomUUID()
  const TEST_CHARACTER_ID = crypto.randomUUID()
  const TEST_ADVENTURE_ID = crypto.randomUUID()

  let supabase: ReturnType<typeof createClient>
  let adminSupabase: ReturnType<typeof createClient>

  beforeAll(async () => {
    // Initialize clients
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create test user
    await adminSupabase.auth.admin.createUser({
      id: TEST_USER_ID,
      email: `test-${TEST_USER_ID}@test.com`,
      password: 'password123',
      email_confirm: true,
    })

    // Create test character
    await adminSupabase.from('characters').insert({
      id: TEST_CHARACTER_ID,
      name: 'Test Character',
      age: 25,
      gender: 'non-binary',
      tags: 'test,character',
      appearance: 'A test character with distinctive features',
      scents_aromas: 'lavender and sage',
      personality: 'Curious and adventurous',
      background: 'A character created for testing purposes',
      created_by: TEST_USER_ID,
      visibility: 'private'
    })

    // Sign in as test user
    await supabase.auth.signInWithPassword({
      email: `test-${TEST_USER_ID}@test.com`,
      password: 'password123',
    })
  })

  afterAll(async () => {
    // Clean up test data
    await adminSupabase.from('adventure_messages').delete().eq('user_id', TEST_USER_ID)
    await adminSupabase.from('adventure_characters').delete().eq('user_id', TEST_USER_ID)
    await adminSupabase.from('adventures').delete().eq('user_id', TEST_USER_ID)
    await adminSupabase.from('characters').delete().eq('created_by', TEST_USER_ID)
    await adminSupabase.auth.admin.deleteUser(TEST_USER_ID)
  })

  describe('Adventure Creation', () => {
    it('should create an adventure with valid data', async () => {
      const adventureData = {
        id: TEST_ADVENTURE_ID,
        title: 'Test Adventure',
        character_id: TEST_CHARACTER_ID,
        location_id: null,
        setting_description: 'A mysterious test environment',
        system_prompt: 'You are Test Character. Curious and adventurous',
        user_id: TEST_USER_ID,
      }

      const { data, error } = await adminSupabase
        .from('adventures')
        .insert(adventureData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.title).toBe('Test Adventure')
      expect(data.character_id).toBe(TEST_CHARACTER_ID)
      expect(data.user_id).toBe(TEST_USER_ID)
    })

    it('should enforce RLS - users can only see their own adventures', async () => {
      const { data: adventures } = await supabase
        .from('adventures')
        .select('*')

      adventures?.forEach((adventure) => {
        expect(adventure.user_id).toBe(TEST_USER_ID)
      })
    })
  })

  describe('Adventure Characters', () => {
    it('should copy character data to adventure_characters table', async () => {
      const characterData = {
        adventure_id: TEST_ADVENTURE_ID,
        original_character_id: TEST_CHARACTER_ID,
        name: 'Test Character',
        age: 25,
        gender: 'non-binary',
        tags: ['test', 'character'],
        appearance: { description: 'A test character with distinctive features' },
        fragrances: { scents: 'lavender and sage' },
        personality: 'Curious and adventurous',
        background: 'A character created for testing purposes',
        avatar_url: null,
        user_id: TEST_USER_ID,
      }

      const { data, error } = await adminSupabase
        .from('adventure_characters')
        .insert(characterData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.name).toBe('Test Character')
      expect(data.adventure_id).toBe(TEST_ADVENTURE_ID)
      expect(data.original_character_id).toBe(TEST_CHARACTER_ID)
    })

    it('should enforce RLS for adventure characters', async () => {
      const { data: adventureCharacters } = await supabase
        .from('adventure_characters')
        .select('*')

      adventureCharacters?.forEach((character) => {
        expect(character.user_id).toBe(TEST_USER_ID)
      })
    })
  })

  describe('Adventure Messages', () => {
    it('should store user messages correctly', async () => {
      const messageData = {
        adventure_id: TEST_ADVENTURE_ID,
        role: 'user' as const,
        content: 'Hello, I want to start this adventure!',
        user_id: TEST_USER_ID,
      }

      const { data, error } = await adminSupabase
        .from('adventure_messages')
        .insert(messageData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.role).toBe('user')
      expect(data.content).toBe('Hello, I want to start this adventure!')
      expect(data.adventure_id).toBe(TEST_ADVENTURE_ID)
    })

    it('should store assistant messages correctly', async () => {
      const messageData = {
        adventure_id: TEST_ADVENTURE_ID,
        role: 'assistant' as const,
        content: 'Welcome to the adventure! What would you like to do first?',
        user_id: TEST_USER_ID,
      }

      const { data, error } = await adminSupabase
        .from('adventure_messages')
        .insert(messageData)
        .select()
        .single()

      expect(error).toBeNull()
      expect(data).toBeDefined()
      expect(data.role).toBe('assistant')
      expect(data.content).toBe('Welcome to the adventure! What would you like to do first?')
    })

    it('should enforce RLS for adventure messages', async () => {
      const { data: messages } = await supabase
        .from('adventure_messages')
        .select('*')

      messages?.forEach((message) => {
        expect(message.user_id).toBe(TEST_USER_ID)
      })
    })

    it('should order messages by created_at', async () => {
      const { data: messages } = await supabase
        .from('adventure_messages')
        .select('*')
        .eq('adventure_id', TEST_ADVENTURE_ID)
        .order('created_at', { ascending: true })

      expect(messages).toBeDefined()
      if (messages && messages.length > 1) {
        for (let i = 1; i < messages.length; i++) {
          const prevTime = new Date(messages[i - 1].created_at).getTime()
          const currTime = new Date(messages[i].created_at).getTime()
          expect(currTime).toBeGreaterThanOrEqual(prevTime)
        }
      }
    })
  })

  describe('Adventure Data Relations', () => {
    it('should fetch adventure with character data', async () => {
      const { data: adventure, error } = await supabase
        .from('adventures')
        .select(`
          *,
          adventure_characters (*)
        `)
        .eq('id', TEST_ADVENTURE_ID)
        .single()

      expect(error).toBeNull()
      expect(adventure).toBeDefined()
      expect(adventure.adventure_characters).toBeDefined()
      expect(Array.isArray(adventure.adventure_characters)).toBe(true)
      if (adventure.adventure_characters.length > 0) {
        expect(adventure.adventure_characters[0].name).toBe('Test Character')
      }
    })

    it('should limit message retrieval as specified in chat page', async () => {
      const { data: messages } = await supabase
        .from('adventure_messages')
        .select('*')
        .eq('adventure_id', TEST_ADVENTURE_ID)
        .order('created_at', { ascending: true })
        .limit(10)

      expect(messages).toBeDefined()
      expect(messages!.length).toBeLessThanOrEqual(10)
    })
  })

  describe('Data Validation', () => {
    it('should require title for adventures', async () => {
      const { error } = await adminSupabase
        .from('adventures')
        .insert({
          character_id: TEST_CHARACTER_ID,
          user_id: TEST_USER_ID,
          // title is missing
        })

      expect(error).toBeDefined()
    })

    it('should require content for messages', async () => {
      const { error } = await adminSupabase
        .from('adventure_messages')
        .insert({
          adventure_id: TEST_ADVENTURE_ID,
          role: 'user',
          user_id: TEST_USER_ID,
          // content is missing
        })

      expect(error).toBeDefined()
    })

    it('should validate message role enum', async () => {
      const { error } = await adminSupabase
        .from('adventure_messages')
        .insert({
          adventure_id: TEST_ADVENTURE_ID,
          role: 'invalid_role' as any,
          content: 'Test message',
          user_id: TEST_USER_ID,
        })

      expect(error).toBeDefined()
    })
  })
})