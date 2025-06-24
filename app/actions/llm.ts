'use server'

import { createClient } from '@/lib/supabase/server'
import { OllamaClient } from '@/lib/ai/ollama/client'
import { getAIConfig, isAIAvailable } from '@/lib/config/validation'
import { buildCharacterContext } from './character-state'

export async function generateLLMResponse(adventureId: string, userMessage: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  try {
    // Check if AI is enabled
    if (!isAIAvailable()) {
      throw new Error('AI features are currently disabled. Please contact an administrator.')
    }

    const aiConfig = getAIConfig()

    // Get adventure and character data
    const { data: adventure, error: adventureError } = await supabase
      .from('adventures')
      .select(`
        *,
        adventure_characters (*)
      `)
      .eq('id', adventureId)
      .eq('user_id', user.id)
      .single()

    if (adventureError || !adventure) {
      throw new Error('Adventure not found')
    }

    // Get recent messages for context
    const { data: recentMessages, error: messagesError } = await supabase
      .from('adventure_messages')
      .select('role, content')
      .eq('adventure_id', adventureId)
      .order('created_at', { ascending: false })
      .limit(9)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
    }

    // Build enhanced character context
    const enhancedContext = await buildCharacterContext(adventureId)
    const systemPrompt = adventure.system_prompt || enhancedContext

    // Build message history (reverse to get chronological order)
    const messageHistory = (recentMessages || []).reverse()
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory,
      { role: 'user', content: userMessage }
    ]

    // Initialize Ollama client with configuration
    const ollama = new OllamaClient({
      baseUrl: aiConfig.ollamaBaseUrl,
      timeout: aiConfig.timeout,
    })

    // Check if Ollama is available
    const isHealthy = await ollama.healthCheck()
    
    if (!isHealthy) {
      throw new Error('LLM service is not available. Please check if Ollama is running at ' + aiConfig.ollamaBaseUrl)
    }

    // Generate response
    const response = await ollama.chat(aiConfig.ollamaModel, llmMessages, {
      temperature: 0.7,
      max_tokens: 500,
    })

    if (!response.message?.content) {
      throw new Error('No response generated from LLM')
    }

    // Save assistant response
    const { data: assistantMessage, error: assistantError } = await supabase
      .from('adventure_messages')
      .insert({
        adventure_id: adventureId,
        role: 'assistant',
        content: response.message.content,
        metadata: { 
          model: response.model, 
          eval_count: response.eval_count,
          total_duration: response.total_duration
        },
        user_id: user.id,
      })
      .select()
      .single()

    if (assistantError) throw assistantError

    return { success: true, message: assistantMessage }
  } catch (error) {
    console.error('Error generating LLM response:', error)
    throw error
  }
}