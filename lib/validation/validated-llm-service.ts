/**
 * Validated LLM Service
 * 
 * Enhanced LLM service that integrates character field validation
 * between AI generation and user presentation.
 */

import { OllamaClient } from '@/lib/ai/ollama/client';
import { LLMResponseValidator, LLMResponseValidationResult } from './llm-response-validator';
import { CharacterFieldValidator } from './character-field-validator';
import { getAIConfig } from '@/lib/config/validation';
import { getValidationConfig, getStopSequences, getContextWindowSize } from '@/lib/config/response-validation';

export interface ValidatedLLMRequest {
  adventureId: string;
  userMessage: string;
  userId: string;
  adventure: {
    id: string;
    adventure_type: string;
    system_prompt: string;
    adventure_characters?: Array<{ name: string; id: string }>;
  };
  messageHistory: Array<{ role: string; content: string }>;
  adventureCharacterId?: string;
}

export interface ValidatedLLMResponse {
  success: boolean;
  content: string;
  validationResult: LLMResponseValidationResult;
  messageMetadata: {
    model: string;
    processingTimeMs: number;
    validationEnabled: boolean;
    retriesUsed: number;
    blockedUpdatesCount: number;
  };
  error?: string;
}

/**
 * Enhanced LLM service with integrated character field validation
 */
export class ValidatedLLMService {
  
  private static readonly VALIDATION_TIMEOUT = 8000; // 8 seconds max for validation
  private static readonly MAX_RETRIES = 2;

  /**
   * Generate a validated LLM response with automatic character field protection
   */
  static async generateValidatedResponse(
    request: ValidatedLLMRequest,
    options: {
      enableValidation?: boolean;
      bypassForAdminUsers?: boolean;
      quickValidationOnly?: boolean;
    } = {}
  ): Promise<ValidatedLLMResponse> {
    
    const startTime = Date.now();
    const {
      enableValidation = true,
      bypassForAdminUsers = false,
      quickValidationOnly = false
    } = options;

    try {
      const aiConfig = getAIConfig();
      const ollama = new OllamaClient({
        baseUrl: aiConfig.ollamaBaseUrl,
        timeout: aiConfig.timeout,
      });

      // Check if validation should be enabled
      let shouldValidate = enableValidation && 
                           request.adventureCharacterId && 
                           !bypassForAdminUsers;

      let validationContext;
      if (shouldValidate) {
        try {
          validationContext = await CharacterFieldValidator.buildValidationContext(
            request.adventureCharacterId!,
            request.userMessage
          );
        } catch (error) {
          console.warn('Failed to build validation context, proceeding without validation:', error);
          shouldValidate = false;
        }
      }

      // Create LLM generation function for validation retry loop
      const generateResponse = async (correctionPrompt?: string, attempt = 1): Promise<string> => {
        const validationConfig = getValidationConfig(request.adventure.adventure_type || 'general');
        const characterName = request.adventure.adventure_characters?.[0]?.name;
        
        // Build messages with optional correction prompt
        let messages = [
          { role: 'system', content: request.adventure.system_prompt },
          ...request.messageHistory,
          { role: 'user', content: request.userMessage }
        ];

        // Add correction prompt if this is a retry
        if (correctionPrompt && attempt > 1) {
          messages.push({
            role: 'system',
            content: `CORRECTION NEEDED: ${correctionPrompt}\n\nPlease rewrite your response to address these issues while maintaining the same emotional tone and character voice.`
          });
        }

        const chatOptions = {
          temperature: attempt > 1 ? 0.6 : 0.7, // Lower temperature for retries
          max_tokens: validationConfig.maxTokens,
          stop: getStopSequences(request.adventure.adventure_type || 'general', characterName)
        };

        const response = await ollama.chat(aiConfig.ollamaModel, messages, chatOptions);
        
        if (!response.message?.content) {
          throw new Error('No response generated from LLM');
        }

        return response.message.content;
      };

      let validationResult: LLMResponseValidationResult;

      if (shouldValidate && validationContext) {
        // Full validation with retry loop
        if (quickValidationOnly) {
          // Quick validation only (for performance-critical paths)
          const initialResponse = await generateResponse();
          const isQuickValid = await LLMResponseValidator.quickValidation(
            initialResponse,
            validationContext
          );
          
          validationResult = {
            isValid: isQuickValid,
            validatedResponse: initialResponse,
            blockedUpdates: [],
            attemptCount: 1,
            finalValidation: isQuickValid,
            processingTimeMs: Date.now() - startTime
          };
        } else {
          // Full validation with correction loop
          const initialResponse = await generateResponse();
          
          validationResult = await LLMResponseValidator.validateResponse(
            initialResponse,
            validationContext,
            generateResponse,
            {
              maxRetries: this.MAX_RETRIES,
              timeoutMs: this.VALIDATION_TIMEOUT,
              bypassValidation: false,
              logBlocked: true
            }
          );
        }
      } else {
        // No validation - direct response
        const response = await generateResponse();
        validationResult = {
          isValid: true,
          validatedResponse: response,
          blockedUpdates: [],
          attemptCount: 1,
          finalValidation: false,
          processingTimeMs: Date.now() - startTime
        };
      }

      // Apply basic formatting validation (existing logic)
      const formattedResponse = this.validateAndFormatResponse(
        validationResult.validatedResponse,
        request.adventure.adventure_type || 'general',
        request.adventure.adventure_characters?.[0]?.name
      );

      // Record approved character field changes (if validation was enabled)
      if (shouldValidate && validationContext && validationResult.isValid) {
        try {
          await LLMResponseValidator.applyApprovedUpdates(
            formattedResponse,
            validationContext
          );
        } catch (error) {
          console.error('Error applying approved character updates:', error);
          // Don't fail the response for this
        }
      }

      const totalProcessingTime = Date.now() - startTime;

      return {
        success: true,
        content: formattedResponse,
        validationResult,
        messageMetadata: {
          model: aiConfig.ollamaModel,
          processingTimeMs: totalProcessingTime,
          validationEnabled: shouldValidate,
          retriesUsed: validationResult.attemptCount - 1,
          blockedUpdatesCount: validationResult.blockedUpdates.length
        }
      };

    } catch (error) {
      console.error('Error in validated LLM service:', error);
      
      return {
        success: false,
        content: '',
        validationResult: {
          isValid: false,
          validatedResponse: '',
          blockedUpdates: [],
          attemptCount: 0,
          finalValidation: false,
          processingTimeMs: Date.now() - startTime
        },
        messageMetadata: {
          model: 'unknown',
          processingTimeMs: Date.now() - startTime,
          validationEnabled: false,
          retriesUsed: 0,
          blockedUpdatesCount: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Legacy response formatting (maintained for compatibility)
   */
  private static validateAndFormatResponse(
    content: string, 
    adventureType: string, 
    characterName?: string
  ): string {
    let formatted = content.trim();
    const config = getValidationConfig(adventureType);

    // Check if response is too long (based on config)
    const paragraphs = formatted.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length > config.maxParagraphs) {
      formatted = paragraphs.slice(0, config.maxParagraphs).join('\n\n');
    }

    // Apply asterisk formatting if enabled
    if (config.enforceAsteriskFormatting && config.actionPatterns.length > 0) {
      const actionPattern = new RegExp(`\\b(She|He|I|They)\\s+(${config.actionPatterns.join('|')})\\b`, 'g');
      formatted = formatted.replace(actionPattern, (match) => {
        if (!match.includes('*')) {
          return `*${match}*`;
        }
        return match;
      });
    }

    // Remove attempts to speak for the user if enabled
    if (config.preventUserSpeaking) {
      config.userPatterns.forEach(pattern => {
        formatted = formatted.replace(pattern, '');
      });
    }

    // Add ending marker if enabled and not present
    if (config.addEndingMarker && 
        !formatted.includes('[END RESPONSE') && 
        !formatted.includes('wait for') && 
        !formatted.includes('waits for')) {
      
      if (adventureType === 'romance') {
        const pronoun = characterName?.toLowerCase().includes('emily') || 
                       characterName?.toLowerCase().includes('she') ? 'She' : 'They';
        formatted += `\n\n*${pronoun} waits for your response.*`;
      } else if (adventureType === 'action') {
        const pronoun = characterName?.toLowerCase().includes('he') || 
                       characterName?.toLowerCase().includes('him') ? 'He' : 'They';
        formatted += `\n\n*${pronoun} waits for your next move.*`;
      }
    }

    // General cleanup for all adventure types
    formatted = formatted
      .replace(/\n\s*\n\s*\n+/g, '\n\n') // Remove excessive newlines
      .replace(/\s+$/, '') // Remove trailing whitespace
      .trim();

    return formatted;
  }

  /**
   * Quick health check for the validation system
   */
  static async healthCheck(): Promise<{
    llmAvailable: boolean;
    validationReady: boolean;
    databaseConnected: boolean;
  }> {
    try {
      const aiConfig = getAIConfig();
      const ollama = new OllamaClient({
        baseUrl: aiConfig.ollamaBaseUrl,
        timeout: 5000,
      });

      const llmHealthy = await ollama.healthCheck();
      
      // Test database connection
      let dbConnected = false;
      try {
        await CharacterFieldValidator.buildValidationContext('test');
      } catch (error) {
        // Expected to fail with test ID, but should connect to DB
        dbConnected = !error?.message?.includes('connection') && 
                     !error?.message?.includes('timeout');
      }

      return {
        llmAvailable: llmHealthy,
        validationReady: true,
        databaseConnected: dbConnected
      };

    } catch (error) {
      console.error('Health check failed:', error);
      return {
        llmAvailable: false,
        validationReady: false,
        databaseConnected: false
      };
    }
  }

  /**
   * Get validation statistics for monitoring
   */
  static getValidationStats() {
    return LLMResponseValidator.getValidationStats();
  }
}