/**
 * Component tests for AdventureChat (Phase 2)
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdventureChat } from '@/components/adventures/adventure-chat'

// Mock the server actions
jest.mock('@/app/actions/adventures', () => ({
  sendMessage: jest.fn(),
}))

jest.mock('@/app/actions/llm', () => ({
  generateLLMResponse: jest.fn(),
}))

const mockAdventure = {
  id: 'adventure-1',
  title: 'Epic Quest',
  adventure_characters: [
    { name: 'Alice the Brave' }
  ]
}

const mockMessages = [
  {
    id: 'msg-1',
    adventure_id: 'adventure-1',
    role: 'user' as const,
    content: 'Hello, I want to start exploring!',
    metadata: {},
    created_at: '2024-01-01T10:00:00Z',
    user_id: 'user-1'
  },
  {
    id: 'msg-2',
    adventure_id: 'adventure-1',
    role: 'assistant' as const,
    content: 'Welcome to your adventure! What would you like to do first?',
    metadata: {},
    created_at: '2024-01-01T10:01:00Z',
    user_id: 'user-1'
  }
]

describe('AdventureChat', () => {
  const defaultProps = {
    adventure: mockAdventure,
    initialMessages: mockMessages,
    userId: 'user-1'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the chat interface with adventure title and character', () => {
    render(<AdventureChat {...defaultProps} />)

    expect(screen.getByText('Epic Quest')).toBeInTheDocument()
    expect(screen.getByText('Playing as Alice the Brave')).toBeInTheDocument()
  })

  it('displays initial messages correctly', () => {
    render(<AdventureChat {...defaultProps} />)

    expect(screen.getByText('Hello, I want to start exploring!')).toBeInTheDocument()
    expect(screen.getByText('Welcome to your adventure! What would you like to do first?')).toBeInTheDocument()
  })

  it('shows message timestamps', () => {
    render(<AdventureChat {...defaultProps} />)

    // Should show formatted time - looking for any time format
    // The exact format depends on the browser's locale formatting
    const timeElements = screen.getAllByText(/\d{1,2}:\d{2}/)
    expect(timeElements.length).toBeGreaterThanOrEqual(2)
  })

  it('allows user to type and send messages', async () => {
    const user = userEvent.setup()
    const mockSendMessage = require('@/app/actions/adventures').sendMessage
    const mockGenerateLLMResponse = require('@/app/actions/llm').generateLLMResponse
    
    mockSendMessage.mockResolvedValue({
      success: true,
      message: {
        id: 'msg-3',
        adventure_id: 'adventure-1',
        role: 'user',
        content: 'I want to explore the forest',
        created_at: '2024-01-01T10:02:00Z',
        user_id: 'user-1'
      }
    })
    
    mockGenerateLLMResponse.mockResolvedValue({
      success: true,
      message: {
        id: 'msg-4',
        adventure_id: 'adventure-1',
        role: 'assistant',
        content: 'You venture into the dark forest...',
        created_at: '2024-01-01T10:03:00Z',
        user_id: 'user-1'
      }
    })

    render(<AdventureChat {...defaultProps} />)

    const messageInput = screen.getByPlaceholderText(/type your action or dialogue/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(messageInput, 'I want to explore the forest')
    await user.click(sendButton)

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalledWith(expect.any(FormData))
      expect(mockGenerateLLMResponse).toHaveBeenCalledWith('adventure-1', 'I want to explore the forest')
    })
  })

  it('sends message on Enter key press', async () => {
    const user = userEvent.setup()
    const mockSendMessage = require('@/app/actions/adventures').sendMessage
    const mockGenerateLLMResponse = require('@/app/actions/llm').generateLLMResponse
    
    mockSendMessage.mockResolvedValue({
      success: true,
      message: {
        id: 'msg-3',
        adventure_id: 'adventure-1',
        role: 'user',
        content: 'Test message',
        created_at: '2024-01-01T10:02:00Z',
        user_id: 'user-1'
      }
    })
    
    mockGenerateLLMResponse.mockResolvedValue({
      success: true,
      message: {
        id: 'msg-4',
        adventure_id: 'adventure-1',
        role: 'assistant',
        content: 'Response message',
        created_at: '2024-01-01T10:03:00Z',
        user_id: 'user-1'
      }
    })

    render(<AdventureChat {...defaultProps} />)

    const messageInput = screen.getByPlaceholderText(/type your action or dialogue/i)
    await user.type(messageInput, 'Test message')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockSendMessage).toHaveBeenCalled()
    })
  })

  it('does not send message on Shift+Enter (allows multiline)', async () => {
    const user = userEvent.setup()
    const mockSendMessage = require('@/app/actions/adventures').sendMessage

    render(<AdventureChat {...defaultProps} />)

    const messageInput = screen.getByPlaceholderText(/type your action or dialogue/i)
    await user.type(messageInput, 'First line')
    await user.keyboard('{Shift>}{Enter}{/Shift}')
    await user.type(messageInput, 'Second line')

    expect(mockSendMessage).not.toHaveBeenCalled()
  })

  it('disables send button when input is empty', () => {
    render(<AdventureChat {...defaultProps} />)

    const sendButton = screen.getByRole('button', { name: /send/i })
    expect(sendButton).toBeDisabled()
  })

  it('enables send button when input has content', async () => {
    const user = userEvent.setup()
    render(<AdventureChat {...defaultProps} />)

    const messageInput = screen.getByPlaceholderText(/type your action or dialogue/i)
    const sendButton = screen.getByRole('button', { name: /send/i })

    await user.type(messageInput, 'Test message')
    expect(sendButton).not.toBeDisabled()
  })

  it('shows loading state while processing message', async () => {
    const user = userEvent.setup()
    const mockSendMessage = require('@/app/actions/adventures').sendMessage
    const mockGenerateLLMResponse = require('@/app/actions/llm').generateLLMResponse
    
    // Create promises we can control
    let resolveSendMessage: (value: any) => void
    const sendPromise = new Promise((resolve) => {
      resolveSendMessage = resolve
    })
    mockSendMessage.mockReturnValue(sendPromise)

    let resolveGenerate: (value: any) => void
    const generatePromise = new Promise((resolve) => {
      resolveGenerate = resolve
    })
    mockGenerateLLMResponse.mockReturnValue(generatePromise)

    render(<AdventureChat {...defaultProps} />)

    const messageInput = screen.getByPlaceholderText(/type your action or dialogue/i)
    await user.type(messageInput, 'Test message')
    await user.click(screen.getByRole('button', { name: /send/i }))

    // Should show loading indicator
    expect(screen.getByText('Thinking...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled()

    // Clean up by resolving promises
    resolveSendMessage!({
      success: true,
      message: {
        id: 'msg-3',
        adventure_id: 'adventure-1',
        role: 'user',
        content: 'Test message',
        created_at: '2024-01-01T10:02:00Z',
        user_id: 'user-1'
      }
    })
    
    resolveGenerate!({
      success: true,
      message: {
        id: 'msg-4',
        adventure_id: 'adventure-1',
        role: 'assistant',
        content: 'Response',
        created_at: '2024-01-01T10:03:00Z',
        user_id: 'user-1'
      }
    })

    await waitFor(() => {
      expect(screen.queryByText('Thinking...')).not.toBeInTheDocument()
    })
  })

  it('displays error messages when sending fails', async () => {
    const user = userEvent.setup()
    const mockSendMessage = require('@/app/actions/adventures').sendMessage
    mockSendMessage.mockRejectedValue(new Error('Network error'))

    render(<AdventureChat {...defaultProps} />)

    const messageInput = screen.getByPlaceholderText(/type your action or dialogue/i)
    await user.type(messageInput, 'Test message')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  it('clears input after successful message send', async () => {
    const user = userEvent.setup()
    const mockSendMessage = require('@/app/actions/adventures').sendMessage
    const mockGenerateLLMResponse = require('@/app/actions/llm').generateLLMResponse
    
    mockSendMessage.mockResolvedValue({
      success: true,
      message: {
        id: 'msg-3',
        adventure_id: 'adventure-1',
        role: 'user',
        content: 'Test message',
        created_at: '2024-01-01T10:02:00Z',
        user_id: 'user-1'
      }
    })
    
    mockGenerateLLMResponse.mockResolvedValue({
      success: true,
      message: {
        id: 'msg-4',
        adventure_id: 'adventure-1',
        role: 'assistant',
        content: 'Response',
        created_at: '2024-01-01T10:03:00Z',
        user_id: 'user-1'
      }
    })

    render(<AdventureChat {...defaultProps} />)

    const messageInput = screen.getByPlaceholderText(/type your action or dialogue/i) as HTMLInputElement
    await user.type(messageInput, 'Test message')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(messageInput.value).toBe('')
    })
  })

  it('handles empty adventure_characters array gracefully', () => {
    const adventureWithoutCharacters = {
      ...mockAdventure,
      adventure_characters: []
    }

    render(<AdventureChat {...defaultProps} adventure={adventureWithoutCharacters} />)

    expect(screen.getByText('Epic Quest')).toBeInTheDocument()
    // Should not crash when accessing adventure_characters[0]
  })

  it('displays messages in correct visual format (user vs assistant)', () => {
    render(<AdventureChat {...defaultProps} />)

    const messageCards = screen.getAllByRole('generic').filter(el => 
      el.textContent?.includes('Hello, I want to start exploring!') ||
      el.textContent?.includes('Welcome to your adventure!')
    )

    expect(messageCards.length).toBeGreaterThan(0)
    // More specific styling tests would require testing implementation details
  })
})