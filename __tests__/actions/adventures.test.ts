/**
 * Server action tests for adventure functionality
 * Tests createAdventure and sendMessage actions
 */

import { createClient } from '@supabase/supabase-js'
import { createAdventure, sendMessage } from '@/app/actions/adventures'
import { beforeAll, afterAll, describe, expect, it, jest } from '@jest/globals'
import crypto from 'crypto'

// Mock Next.js functions
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  revalidatePath: jest.fn(),
}))

describe('Adventure Server Actions', () => {
  const TEST_USER_ID = crypto.randomUUID()
  const TEST_CHARACTER_ID = crypto.randomUUID()
  const TEST_LOCATION_ID = crypto.randomUUID()

  let adminSupabase: ReturnType<typeof createClient>

  beforeAll(async () => {
    adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create test user
    await adminSupabase.auth.admin.createUser({
      id: TEST_USER_ID,
      email: `test-actions-${TEST_USER_ID}@test.com`,
      password: 'password123',
      email_confirm: true,
    })

    // Create test character
    await adminSupabase.from('characters').insert({
      id: TEST_CHARACTER_ID,
      name: 'Test Character',
      age: 30,
      gender: 'neutral',
      tags: 'test,character',
      appearance: 'A test character',
      scents_aromas: 'fresh air',
      personality: 'Helpful and curious',
      background: 'Created for testing',
      created_by: TEST_USER_ID,
      visibility: 'private'
    })

    // Create test location
    await adminSupabase.from('locations').insert({
      id: TEST_LOCATION_ID,
      name: 'Test Location',
      description: 'A location for testing',
      created_by: TEST_USER_ID,
    })
  })

  afterAll(async () => {
    // Clean up test data
    await adminSupabase.from('adventure_messages').delete().eq('user_id', TEST_USER_ID)
    await adminSupabase.from('adventure_characters').delete().eq('user_id', TEST_USER_ID)
    await adminSupabase.from('adventures').delete().eq('user_id', TEST_USER_ID)
    await adminSupabase.from('locations').delete().eq('created_by', TEST_USER_ID)
    await adminSupabase.from('characters').delete().eq('created_by', TEST_USER_ID)
    await adminSupabase.auth.admin.deleteUser(TEST_USER_ID)
  })

  describe('createAdventure', () => {
    it('should create adventure with required fields only', async () => {
      const formData = new FormData()
      formData.append('title', 'Basic Test Adventure')
      formData.append('characterId', TEST_CHARACTER_ID)

      // Mock the redirect function to prevent actual navigation
      const mockRedirect = require('next/navigation').redirect
      mockRedirect.mockImplementation(() => {
        throw new Error('REDIRECT') // Throw to stop execution after redirect
      })

      // Mock authenticated user
      jest.spyOn(require('@/lib/supabase/server'), 'createClient').mockImplementation(() => ({
        auth: {
          getUser: () => Promise.resolve({
            data: { user: { id: TEST_USER_ID } },
            error: null
          })
        },
        from: (table: string) => ({
          select: (columns: string) => ({
            eq: (column: string, value: string) => ({
              single: () => {
                if (table === 'characters' && value === TEST_CHARACTER_ID) {
                  return Promise.resolve({
                    data: {
                      id: TEST_CHARACTER_ID,
                      name: 'Test Character',
                      age: 30,
                      gender: 'neutral',
                      personality: 'Helpful and curious',
                      background: 'Created for testing',
                      scents_aromas: 'fresh air',
                      image_url: null,
                    },
                    error: null
                  })
                }
                return Promise.resolve({ data: null, error: new Error('Not found') })
              }
            })
          }),
          insert: (data: any) => ({
            select: () => ({
              single: () => Promise.resolve({
                data: { id: crypto.randomUUID(), ...data },
                error: null
              })
            })
          }),
          update: (data: any) => ({
            eq: (column: string, value: string) => Promise.resolve({
              data: null,
              error: null
            })
          })
        })
      }))

      await expect(createAdventure(formData)).rejects.toThrow('REDIRECT')
      expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/adventures/'))
    })

    it('should create adventure with all optional fields', async () => {
      const formData = new FormData()
      formData.append('title', 'Complete Test Adventure')
      formData.append('characterId', TEST_CHARACTER_ID)
      formData.append('locationId', TEST_LOCATION_ID)
      formData.append('settingDescription', 'A comprehensive test setting')

      const mockRedirect = require('next/navigation').redirect
      mockRedirect.mockImplementation(() => {
        throw new Error('REDIRECT')
      })

      await expect(createAdventure(formData)).rejects.toThrow('REDIRECT')
    })

    it('should throw error when title is missing', async () => {
      const formData = new FormData()
      formData.append('characterId', TEST_CHARACTER_ID)

      await expect(createAdventure(formData)).rejects.toThrow('Title and character are required')
    })

    it('should throw error when characterId is missing', async () => {
      const formData = new FormData()
      formData.append('title', 'Test Adventure')

      await expect(createAdventure(formData)).rejects.toThrow('Title and character are required')
    })

    it('should throw error when character not found', async () => {
      const formData = new FormData()
      formData.append('title', 'Test Adventure')
      formData.append('characterId', 'non-existent-character')

      jest.spyOn(require('@/lib/supabase/server'), 'createClient').mockImplementation(() => ({
        auth: {
          getUser: () => Promise.resolve({
            data: { user: { id: TEST_USER_ID } },
            error: null
          })
        },
        from: (table: string) => ({
          select: (columns: string) => ({
            eq: (column: string, value: string) => ({
              single: () => Promise.resolve({
                data: null,
                error: new Error('Character not found')
              })
            })
          })
        })
      }))

      await expect(createAdventure(formData)).rejects.toThrow('Character not found or not accessible')
    })

    it('should handle character data mapping correctly', async () => {
      const formData = new FormData()
      formData.append('title', 'Mapping Test Adventure')
      formData.append('characterId', TEST_CHARACTER_ID)

      const mockRedirect = require('next/navigation').redirect
      mockRedirect.mockImplementation(() => {
        throw new Error('REDIRECT')
      })

      let adventureCharacterData: any = null

      jest.spyOn(require('@/lib/supabase/server'), 'createClient').mockImplementation(() => ({
        auth: {
          getUser: () => Promise.resolve({
            data: { user: { id: TEST_USER_ID } },
            error: null
          })
        },
        from: (table: string) => ({
          select: (columns: string) => ({
            eq: (column: string, value: string) => ({
              single: () => {
                if (table === 'characters') {
                  return Promise.resolve({
                    data: {
                      id: TEST_CHARACTER_ID,
                      name: 'Test Character',
                      age: 30,
                      gender: 'neutral',
                      tags: 'test,character',
                      appearance: 'A test character',
                      scents_aromas: 'fresh air',
                      personality: 'Helpful and curious',
                      background: 'Created for testing',
                      image_url: 'https://example.com/avatar.jpg',
                    },
                    error: null
                  })
                }
                return Promise.resolve({ data: null, error: null })
              }
            })
          }),
          insert: (data: any) => {
            if (table === 'adventure_characters') {
              adventureCharacterData = data
            }
            return {
              select: () => ({
                single: () => Promise.resolve({
                  data: { id: crypto.randomUUID(), ...data },
                  error: null
                })
              })
            }
          },
          update: (data: any) => ({
            eq: (column: string, value: string) => Promise.resolve({
              data: null,
              error: null
            })
          })
        })
      }))

      await expect(createAdventure(formData)).rejects.toThrow('REDIRECT')

      // Verify character data mapping
      expect(adventureCharacterData).toMatchObject({
        name: 'Test Character',
        age: 30,
        gender: 'neutral',
        tags: ['test,character'], // Should be converted to array
        appearance: { description: 'A test character' }, // Should be wrapped in object
        fragrances: { scents: 'fresh air' }, // scents_aromas should map to fragrances
        personality: 'Helpful and curious',
        background: 'Created for testing',
        avatar_url: 'https://example.com/avatar.jpg', // image_url should map to avatar_url
        user_id: TEST_USER_ID,
      })
    })
  })

  describe('sendMessage', () => {
    let testAdventureId: string

    beforeAll(async () => {
      // Create a test adventure for message testing
      const { data: adventure } = await adminSupabase
        .from('adventures')
        .insert({
          title: 'Message Test Adventure',
          character_id: TEST_CHARACTER_ID,
          user_id: TEST_USER_ID,
        })
        .select()
        .single()

      testAdventureId = adventure.id
    })

    it('should save user message successfully', async () => {
      const formData = new FormData()
      formData.append('adventureId', testAdventureId)
      formData.append('content', 'This is a test message from the user')

      jest.spyOn(require('@/lib/supabase/server'), 'createClient').mockImplementation(() => ({
        auth: {
          getUser: () => Promise.resolve({
            data: { user: { id: TEST_USER_ID } },
            error: null
          })
        },
        from: (table: string) => ({
          select: (columns: string) => ({
            eq: (column: string, value: string) => ({
              single: () => {
                if (table === 'adventures') {
                  return Promise.resolve({
                    data: { id: testAdventureId },
                    error: null
                  })
                }
                return Promise.resolve({ data: null, error: null })
              }
            })
          }),
          insert: (data: any) => ({
            select: () => ({
              single: () => Promise.resolve({
                data: {
                  id: crypto.randomUUID(),
                  adventure_id: testAdventureId,
                  role: 'user',
                  content: 'This is a test message from the user',
                  user_id: TEST_USER_ID,
                  created_at: new Date().toISOString(),
                },
                error: null
              })
            })
          })
        })
      }))

      const result = await sendMessage(formData)

      expect(result.success).toBe(true)
      expect(result.message).toBeDefined()
      expect(result.message.content).toBe('This is a test message from the user')
      expect(result.message.role).toBe('user')
    })

    it('should throw error when adventureId is missing', async () => {
      const formData = new FormData()
      formData.append('content', 'Test message')

      await expect(sendMessage(formData)).rejects.toThrow('Adventure ID and content are required')
    })

    it('should throw error when content is missing', async () => {
      const formData = new FormData()
      formData.append('adventureId', testAdventureId)

      await expect(sendMessage(formData)).rejects.toThrow('Adventure ID and content are required')
    })

    it('should throw error when adventure not found', async () => {
      const formData = new FormData()
      formData.append('adventureId', 'non-existent-adventure')
      formData.append('content', 'Test message')

      jest.spyOn(require('@/lib/supabase/server'), 'createClient').mockImplementation(() => ({
        auth: {
          getUser: () => Promise.resolve({
            data: { user: { id: TEST_USER_ID } },
            error: null
          })
        },
        from: (table: string) => ({
          select: (columns: string) => ({
            eq: (column: string, value: string) => ({
              single: () => Promise.resolve({
                data: null,
                error: new Error('Adventure not found')
              })
            })
          })
        })
      }))

      await expect(sendMessage(formData)).rejects.toThrow('Adventure not found or not accessible')
    })

    it('should trim message content', async () => {
      const formData = new FormData()
      formData.append('adventureId', testAdventureId)
      formData.append('content', '  Message with whitespace  ')

      let savedMessage: any = null

      jest.spyOn(require('@/lib/supabase/server'), 'createClient').mockImplementation(() => ({
        auth: {
          getUser: () => Promise.resolve({
            data: { user: { id: TEST_USER_ID } },
            error: null
          })
        },
        from: (table: string) => ({
          select: (columns: string) => ({
            eq: (column: string, value: string) => ({
              single: () => {
                if (table === 'adventures') {
                  return Promise.resolve({
                    data: { id: testAdventureId },
                    error: null
                  })
                }
                return Promise.resolve({ data: null, error: null })
              }
            })
          }),
          insert: (data: any) => {
            if (table === 'adventure_messages') {
              savedMessage = data
            }
            return {
              select: () => ({
                single: () => Promise.resolve({
                  data: {
                    id: crypto.randomUUID(),
                    ...data,
                    created_at: new Date().toISOString(),
                  },
                  error: null
                })
              })
            }
          }
        })
      }))

      await sendMessage(formData)

      expect(savedMessage.content).toBe('Message with whitespace')
    })
  })
})