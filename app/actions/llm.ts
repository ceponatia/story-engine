'use server'

import { isAIAvailable } from '@/lib/config/validation'
import { buildCharacterContext } from './character-state'
import { 
  getAdventureById,
  getAdventureMessages,
  createAdventureMessage
} from '@/lib/database/queries'
import { requireAuth } from '@/lib/auth-helper'
import { getContextWindowSize } from '@/lib/config/response-validation'
import { ValidatedLLMService } from '@/lib/validation/validated-llm-service'


export async function generateLLMResponse(adventureId: string, userMessage: string) {
  try {
    const { user } = await requireAuth()

    // Check if AI is enabled
    if (!isAIAvailable()) {
      return { 
        success: false, 
        error: 'AI features are currently disabled. Please contact an administrator.',
        message: null
      }
    }

    // Get adventure data
    const adventure = await getAdventureById(adventureId, user.id)
    
    if (!adventure) {
      return { 
        success: false, 
        error: 'Adventure not found or not accessible',
        message: null
      }
    }

    // Get recent messages for context with dynamic window sizing
    const contextWindowSize = getContextWindowSize(adventure.adventure_type || 'general')
    const recentMessages = await getAdventureMessages(adventureId, contextWindowSize)

    // Build enhanced character context
    const enhancedContext = await buildCharacterContext(adventureId)
    const systemPrompt = adventure.system_prompt || enhancedContext

    // Build message history (already in chronological order from database)
    const messageHistory = recentMessages.map(msg => ({
      role: msg.role, // Use the role field directly from database
      content: msg.content
    }))

    // Get adventure character ID for validation
    const adventureCharacterId = adventure.adventure_characters?.[0]?.id

    // Use validated LLM service with character field protection
    const validatedResponse = await ValidatedLLMService.generateValidatedResponse({
      adventureId,
      userMessage,
      userId: user.id,
      adventure: {
        id: adventure.id,
        adventure_type: adventure.adventure_type || 'general',
        system_prompt: systemPrompt,
        adventure_characters: adventure.adventure_characters
      },
      messageHistory,
      adventureCharacterId
    }, {
      enableValidation: true,
      bypassForAdminUsers: false, // TODO: Add admin role check
      quickValidationOnly: false
    })

    if (!validatedResponse.success) {
      return { 
        success: false, 
        error: validatedResponse.error || 'Failed to generate validated response',
        message: null
      }
    }

    const formattedResponse = validatedResponse.content

    // Save assistant response to PostgreSQL database
    const assistantMessage = await createAdventureMessage(
      adventureId,
      'assistant',
      formattedResponse,
      user.id,
      { 
        model: validatedResponse.messageMetadata.model,
        validation_enabled: validatedResponse.messageMetadata.validationEnabled,
        retries_used: validatedResponse.messageMetadata.retriesUsed,
        blocked_updates_count: validatedResponse.messageMetadata.blockedUpdatesCount,
        processing_time_ms: validatedResponse.messageMetadata.processingTimeMs,
        validation_final: validatedResponse.validationResult.finalValidation,
        blocked_updates: validatedResponse.validationResult.blockedUpdates.length > 0 ? 
          validatedResponse.validationResult.blockedUpdates : undefined
      }
    )

    // Phase 2: Automated State Extraction (non-blocking)
    try {
      const { processLLMResponse, getAutomatedStateConfig } = await import('@/lib/ai/functions')
      const stateConfig = getAutomatedStateConfig(adventure.adventure_type || 'general')
      
      if (stateConfig.enabled && stateConfig.enabledFor[adventure.adventure_type as keyof typeof stateConfig.enabledFor] !== false) {
        // Process state extraction asynchronously to avoid slowing chat responses
        const stateProcessing = processLLMResponse(formattedResponse, adventureId, user.id, {
          extractionMode: stateConfig.extractionMode,
          minConfidence: stateConfig.minConfidence,
          dryRun: false
        })
        
        // Log results but don't await to keep response fast
        stateProcessing.then(result => {
          if (result.success && result.stateExtraction?.extractions.length) {
            console.log(`State extraction completed: ${result.stateExtraction.extractions.length} changes detected for adventure ${adventureId}`)
            if (result.stateUpdate?.updatesApplied) {
              console.log(`Applied ${result.stateUpdate.updatesApplied} state updates (${result.stateUpdate.highConfidenceUpdates} high confidence)`)
            }
          }
          if (result.errors.length > 0) {
            console.warn('State extraction errors:', result.errors)
          }
        }).catch(error => {
          console.error('Automated state extraction failed:', error)
        })
      }
    } catch (error) {
      // Log but don't fail the response if state extraction has issues
      console.warn('State extraction module unavailable:', error)
    }

    return { success: true, message: assistantMessage }
  } catch (error) {
    console.error('Error generating LLM response:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred while generating response',
      message: null
    }
  }
}