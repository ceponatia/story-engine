/**
 * Integration tests for LLM chat functionality (Phase 2)
 * Tests the full flow from user message to LLM response
 */

import { createClient } from '@supabase/supabase-js'
import { generateLLMResponse } from '@/app/actions/llm'
import { sendMessage } from '@/app/actions/adventures'
import { buildCharacterContext } from '@/app/actions/character-state'
import { OllamaClient } from '@/lib/ai/ollama/client'
import { getAIConfig, isAIAvailable } from '@/lib/config/validation'
import { beforeAll, afterAll, describe, expect, it, jest } from '@jest/globals'
import crypto from 'crypto'

// Mock the AI configuration and Ollama client
jest.mock('@/lib/config/validation', () => ({
  isAIAvailable: jest.fn(),
  getAIConfig: jest.fn(),
}))

jest.mock('@/lib/ai/ollama/client')
jest.mock('@/app/actions/character-state')

describe('LLM Chat Integration Tests', () => {
  const TEST_USER_ID = crypto.randomUUID()
  const TEST_CHARACTER_ID = crypto.randomUUID()
  const TEST_ADVENTURE_ID = crypto.randomUUID()

  let supabase: ReturnType<typeof createClient>
  let adminSupabase: ReturnType<typeof createClient>

  const mockOllamaClient = {
    healthCheck: jest.fn(),
    chat: jest.fn(),
  }

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

    // Mock AI configuration
    const mockGetAIConfig = getAIConfig as jest.MockedFunction<typeof getAIConfig>
    mockGetAIConfig.mockReturnValue({
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'mistral:7b-instruct-v0.1-q4_0',
      timeout: 30000,
    })

    const mockIsAIAvailable = isAIAvailable as jest.MockedFunction<typeof isAIAvailable>
    mockIsAIAvailable.mockReturnValue(true)

    // Mock Ollama client
    const MockOllamaClient = OllamaClient as jest.MockedClass<typeof OllamaClient>
    MockOllamaClient.mockImplementation(() => mockOllamaClient as any)

    // Mock character context builder
    const mockBuildCharacterContext = buildCharacterContext as jest.MockedFunction<typeof buildCharacterContext>
    mockBuildCharacterContext.mockResolvedValue('You are Alice, a brave adventurer.')

    // Create test user
    await adminSupabase.auth.admin.createUser({
      id: TEST_USER_ID,
      email: `test-llm-${TEST_USER_ID}@test.com`,
      password: 'password123',
      email_confirm: true,
    })

    // Create test character
    await adminSupabase.from('characters').insert({
      id: TEST_CHARACTER_ID,
      name: 'Alice',
      age: 25,
      gender: 'female',
      personality: 'Brave and adventurous',
      background: 'A skilled warrior from the northern lands',
      created_by: TEST_USER_ID,
      visibility: 'private'
    })

    // Create test adventure
    await adminSupabase.from('adventures').insert({
      id: TEST_ADVENTURE_ID,
      title: 'Test LLM Adventure',
      character_id: TEST_CHARACTER_ID,
      system_prompt: 'You are Alice, a brave adventurer.',
      user_id: TEST_USER_ID,
    })

    // Create adventure character
    await adminSupabase.from('adventure_characters').insert({
      adventure_id: TEST_ADVENTURE_ID,
      original_character_id: TEST_CHARACTER_ID,
      name: 'Alice',
      age: 25,
      gender: 'female',
      personality: 'Brave and adventurous',
      background: 'A skilled warrior from the northern lands',
      user_id: TEST_USER_ID,
    })

    // Sign in as test user
    await supabase.auth.signInWithPassword({
      email: `test-llm-${TEST_USER_ID}@test.com`,
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

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up default mock responses
    mockOllamaClient.healthCheck.mockResolvedValue(true)
    mockOllamaClient.chat.mockResolvedValue({
      message: {
        content: 'I draw my sword and prepare for battle, scanning the area for threats.',
      },
      model: 'mistral:7b-instruct-v0.1-q4_0',
      eval_count: 50,
      total_duration: 2000,
    })
  })

  describe('Full Chat Flow', () => {
    it('should complete a full message exchange flow', async () => {
      const userMessage = 'I want to explore the dark forest ahead'

      // Step 1: Send user message
      const formData = new FormData()
      formData.append('adventureId', TEST_ADVENTURE_ID)
      formData.append('content', userMessage)

      const userResult = await sendMessage(formData)
      
      expect(userResult.success).toBe(true)
      expect(userResult.message).toBeDefined()
      expect(userResult.message.content).toBe(userMessage)
      expect(userResult.message.role).toBe('user')

      // Step 2: Generate LLM response
      const llmResult = await generateLLMResponse(TEST_ADVENTURE_ID, userMessage)

      expect(llmResult.success).toBe(true)
      expect(llmResult.message).toBeDefined()
      expect(llmResult.message.role).toBe('assistant')
      expect(llmResult.message.content).toBe('I draw my sword and prepare for battle, scanning the area for threats.')
      expect(llmResult.message.metadata).toMatchObject({
        model: 'mistral:7b-instruct-v0.1-q4_0',
        eval_count: 50,
        total_duration: 2000,
      })

      // Step 3: Verify messages are stored in database
      const { data: messages } = await supabase
        .from('adventure_messages')
        .select('*')
        .eq('adventure_id', TEST_ADVENTURE_ID)
        .order('created_at', { ascending: true })

      expect(messages).toHaveLength(2)
      expect(messages![0].role).toBe('user')
      expect(messages![0].content).toBe(userMessage)
      expect(messages![1].role).toBe('assistant')
      expect(messages![1].content).toBe('I draw my sword and prepare for battle, scanning the area for threats.')
    })

    it('should include message history in LLM context', async () => {
      // Add some existing messages
      await adminSupabase.from('adventure_messages').insert([
        {
          adventure_id: TEST_ADVENTURE_ID,
          role: 'user',
          content: 'What do I see around me?',
          user_id: TEST_USER_ID,
        },
        {
          adventure_id: TEST_ADVENTURE_ID,
          role: 'assistant',
          content: 'You see a dark forest stretching ahead of you.',
          user_id: TEST_USER_ID,
        }
      ])

      await generateLLMResponse(TEST_ADVENTURE_ID, 'I move forward carefully')

      // Verify that chat was called with message history
      expect(mockOllamaClient.chat).toHaveBeenCalledWith(
        'mistral:7b-instruct-v0.1-q4_0',
        expect.arrayContaining([
          { role: 'system', content: 'You are Alice, a brave adventurer.' },
          { role: 'user', content: 'What do I see around me?' },
          { role: 'assistant', content: 'You see a dark forest stretching ahead of you.' },
          { role: 'user', content: 'I move forward carefully' }
        ]),
        expect.objectContaining({
          temperature: 0.7,
          max_tokens: 500,
        })
      )
    })

    it('should limit message history to recent messages', async () => {
      // Add many messages to test the limit (current limit is 9 in the code)
      const manyMessages = Array.from({ length: 15 }, (_, i) => ({
        adventure_id: TEST_ADVENTURE_ID,
        role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
        content: `Message ${i + 1}`,
        user_id: TEST_USER_ID,
      }))

      await adminSupabase.from('adventure_messages').insert(manyMessages)

      await generateLLMResponse(TEST_ADVENTURE_ID, 'Current message')

      // Should include system prompt + at most 9 recent messages + current message
      const callArgs = mockOllamaClient.chat.mock.calls[0]
      const messages = callArgs[1]
      
      expect(messages.length).toBeLessThanOrEqual(11) // 1 system + 9 history + 1 current
      expect(messages[0].role).toBe('system')
      expect(messages[messages.length - 1].content).toBe('Current message')
    })
  })

  describe('Error Handling', () => {
    it('should handle AI being disabled', async () => {
      const mockIsAIAvailable = isAIAvailable as jest.MockedFunction<typeof isAIAvailable>
      mockIsAIAvailable.mockReturnValue(false)

      await expect(generateLLMResponse(TEST_ADVENTURE_ID, 'Test message'))
        .rejects.toThrow('AI features are currently disabled')
    })

    it('should handle Ollama health check failure', async () => {
      mockOllamaClient.healthCheck.mockResolvedValue(false)

      await expect(generateLLMResponse(TEST_ADVENTURE_ID, 'Test message'))
        .rejects.toThrow('LLM service is not available')
    })

    it('should handle empty LLM response', async () => {
      mockOllamaClient.chat.mockResolvedValue({
        message: { content: '' },
        model: 'mistral:7b-instruct-v0.1-q4_0',
        eval_count: 0,
        total_duration: 1000,
      })

      await expect(generateLLMResponse(TEST_ADVENTURE_ID, 'Test message'))
        .rejects.toThrow('No response generated from LLM')
    })

    it('should handle adventure not found', async () => {
      await expect(generateLLMResponse('non-existent-adventure', 'Test message'))
        .rejects.toThrow('Adventure not found')
    })

    it('should handle user not authenticated', async () => {
      // Sign out user
      await supabase.auth.signOut()

      await expect(generateLLMResponse(TEST_ADVENTURE_ID, 'Test message'))
        .rejects.toThrow('Not authenticated')

      // Sign back in for cleanup
      await supabase.auth.signInWithPassword({
        email: `test-llm-${TEST_USER_ID}@test.com`,
        password: 'password123',
      })
    })

    it('should handle Ollama client errors', async () => {
      mockOllamaClient.chat.mockRejectedValue(new Error('Connection timeout'))

      await expect(generateLLMResponse(TEST_ADVENTURE_ID, 'Test message'))
        .rejects.toThrow('Connection timeout')
    })
  })

  describe('Character Context Integration', () => {
    it('should use enhanced character context when system_prompt is not set', async () => {
      // Update adventure to have no system prompt
      await adminSupabase
        .from('adventures')
        .update({ system_prompt: null })
        .eq('id', TEST_ADVENTURE_ID)

      const mockBuildCharacterContext = buildCharacterContext as jest.MockedFunction<typeof buildCharacterContext>
      mockBuildCharacterContext.mockResolvedValue('Enhanced character context with details')

      await generateLLMResponse(TEST_ADVENTURE_ID, 'Test message')

      expect(mockBuildCharacterContext).toHaveBeenCalledWith(TEST_ADVENTURE_ID)
      expect(mockOllamaClient.chat).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          { role: 'system', content: 'Enhanced character context with details' }
        ]),
        expect.any(Object)
      )

      // Restore system prompt for other tests
      await adminSupabase
        .from('adventures')
        .update({ system_prompt: 'You are Alice, a brave adventurer.' })
        .eq('id', TEST_ADVENTURE_ID)
    })

    it('should prefer system_prompt over enhanced context when available', async () => {
      const mockBuildCharacterContext = buildCharacterContext as jest.MockedFunction<typeof buildCharacterContext>
      mockBuildCharacterContext.mockResolvedValue('Enhanced character context')

      await generateLLMResponse(TEST_ADVENTURE_ID, 'Test message')

      expect(mockOllamaClient.chat).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          { role: 'system', content: 'You are Alice, a brave adventurer.' }
        ]),
        expect.any(Object)
      )
    })
  })

  describe('Message Metadata', () => {
    it('should store LLM response metadata correctly', async () => {
      mockOllamaClient.chat.mockResolvedValue({
        message: { content: 'Test response' },
        model: 'custom-model',
        eval_count: 100,
        total_duration: 5000,
      })

      const result = await generateLLMResponse(TEST_ADVENTURE_ID, 'Test message')

      expect(result.message.metadata).toEqual({
        model: 'custom-model',
        eval_count: 100,
        total_duration: 5000,
      })
    })

    it('should handle missing metadata fields gracefully', async () => {
      mockOllamaClient.chat.mockResolvedValue({
        message: { content: 'Test response' },
        model: 'test-model',
        // Missing eval_count and total_duration
      })

      const result = await generateLLMResponse(TEST_ADVENTURE_ID, 'Test message')

      expect(result.message.metadata).toEqual({
        model: 'test-model',
        eval_count: undefined,
        total_duration: undefined,
      })
    })
  })
})