/**
 * LLM Response Validation Service
 * 
 * Validates LLM responses for character field updates before presenting to user.
 * Provides transparent correction loop when validation fails.
 */

import { CharacterFieldValidator, ValidationContext, FieldUpdateRequest } from './character-field-validator';
import { parseCharacterUpdate } from '@/lib/parsers/character-update-parser';
import { UnifiedParserResult } from '@/lib/parsers/unified-parser';

export interface LLMResponseValidationResult {
  isValid: boolean;
  validatedResponse: string;
  blockedUpdates: BlockedUpdate[];
  attemptCount: number;
  finalValidation: boolean;
  processingTimeMs: number;
}

export interface BlockedUpdate {
  fieldPath: string;
  attemptedValue: any;
  reason: string;
  confidence: number;
  suggestedCorrection: string;
}

export interface ValidationOptions {
  maxRetries: number;
  timeoutMs: number;
  bypassValidation: boolean;
  logBlocked: boolean;
}

/**
 * Service for validating LLM responses and handling automatic corrections
 */
export class LLMResponseValidator {
  
  private static readonly DEFAULT_OPTIONS: ValidationOptions = {
    maxRetries: 2,
    timeoutMs: 10000, // 10 seconds max processing time
    bypassValidation: false,
    logBlocked: true
  };

  /**
   * Validate an LLM response and automatically retry if validation fails
   */
  static async validateResponse(
    llmResponse: string,
    context: ValidationContext,
    generateNewResponse: (correctionPrompt: string, attempt: number) => Promise<string>,
    options: Partial<ValidationOptions> = {}
  ): Promise<LLMResponseValidationResult> {
    
    const startTime = Date.now();
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    if (opts.bypassValidation) {
      return {
        isValid: true,
        validatedResponse: llmResponse,
        blockedUpdates: [],
        attemptCount: 1,
        finalValidation: true,
        processingTimeMs: Date.now() - startTime
      };
    }

    let currentResponse = llmResponse;
    let attemptCount = 1;
    let allBlockedUpdates: BlockedUpdate[] = [];

    for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
      
      // Check timeout
      if (Date.now() - startTime > opts.timeoutMs) {
        console.warn('LLM response validation timeout, using last response');
        break;
      }

      const validation = await this.validateSingleResponse(currentResponse, context);
      
      if (validation.isValid) {
        return {
          isValid: true,
          validatedResponse: currentResponse,
          blockedUpdates: allBlockedUpdates,
          attemptCount: attempt,
          finalValidation: true,
          processingTimeMs: Date.now() - startTime
        };
      }

      // Accumulate blocked updates for logging
      allBlockedUpdates.push(...validation.blockedUpdates);

      // If this is the last attempt, return the response anyway
      if (attempt > opts.maxRetries) {
        if (opts.logBlocked) {
          console.warn('LLM response validation failed after max retries:', {
            adventureCharacterId: context.adventureCharacterId,
            blockedUpdates: validation.blockedUpdates,
            finalResponse: currentResponse
          });
        }
        
        return {
          isValid: false,
          validatedResponse: currentResponse,
          blockedUpdates: allBlockedUpdates,
          attemptCount: attempt,
          finalValidation: false,
          processingTimeMs: Date.now() - startTime
        };
      }

      // Generate correction prompt and get new response
      const correctionPrompt = this.generateCorrectionPrompt(validation.blockedUpdates, attempt);
      
      try {
        currentResponse = await generateNewResponse(correctionPrompt, attempt);
        attemptCount = attempt + 1;
      } catch (error) {
        console.error('Error generating corrected LLM response:', error);
        break;
      }
    }

    return {
      isValid: false,
      validatedResponse: currentResponse,
      blockedUpdates: allBlockedUpdates,
      attemptCount,
      finalValidation: false,
      processingTimeMs: Date.now() - startTime
    };
  }

  /**
   * Validate a single LLM response for character field violations
   */
  private static async validateSingleResponse(
    response: string,
    context: ValidationContext
  ): Promise<{ isValid: boolean; blockedUpdates: BlockedUpdate[] }> {
    
    try {
      // Extract potential character updates from the response
      const fieldUpdates = this.extractFieldUpdates(response);
      
      if (fieldUpdates.length === 0) {
        return { isValid: true, blockedUpdates: [] };
      }

      // Validate each field update
      const validationResults = await CharacterFieldValidator.validateFieldUpdates(
        fieldUpdates,
        { ...context, messageContext: response }
      );

      const blockedUpdates: BlockedUpdate[] = [];

      for (let i = 0; i < fieldUpdates.length; i++) {
        const update = fieldUpdates[i];
        const validation = validationResults[i];

        if (!validation.allowed) {
          blockedUpdates.push({
            fieldPath: update.fieldPath,
            attemptedValue: update.newValue,
            reason: validation.reason,
            confidence: validation.confidence,
            suggestedCorrection: validation.suggestedCorrection || 'Please avoid changing this field.'
          });
        }
      }

      return {
        isValid: blockedUpdates.length === 0,
        blockedUpdates
      };

    } catch (error) {
      console.error('Error validating LLM response:', error);
      return { isValid: true, blockedUpdates: [] }; // Fail open to avoid breaking conversation
    }
  }

  /**
   * Extract field updates from LLM response text
   */
  private static extractFieldUpdates(response: string): FieldUpdateRequest[] {
    const updates: FieldUpdateRequest[] = [];

    // Try to parse updates for each field type
    const fieldTypes: Array<'appearance' | 'personality' | 'scents'> = ['appearance', 'personality', 'scents'];

    for (const fieldType of fieldTypes) {
      try {
        const parsed = parseCharacterUpdate(response, fieldType);
        
        if (parsed && Object.keys(parsed.parsedData).length > 0) {
          // Convert UnifiedParserResult to FieldUpdateRequest[]
          Object.entries(parsed.parsedData).forEach(([fieldPath, value]) => {
            updates.push({
              fieldPath,
              newValue: value,
              sourceText: response,
              parsedData: parsed.parsedData
            });
          });
        }
      } catch (error) {
        // Continue processing other field types
        console.debug(`Error parsing ${fieldType} from response:`, error);
      }
    }

    return updates;
  }

  /**
   * Generate correction prompt for LLM retry
   */
  private static generateCorrectionPrompt(blockedUpdates: BlockedUpdate[], attempt: number): string {
    const issues = blockedUpdates.map(update => {
      const [category, attribute] = update.fieldPath.split('.');
      return `- ${category}.${attribute}: ${update.suggestedCorrection}`;
    }).join('\n');

    const urgency = attempt > 1 ? 'CRITICAL: ' : '';
    
    return `${urgency}Your previous response attempted to modify protected character traits that cannot be changed:

${issues}

Please rewrite your response to avoid changing these characteristics while maintaining the same conversational flow and emotional content. Keep all dialogue and actions, but remove or modify any descriptions that would alter the protected traits listed above.

Remember:
- Focus on temporary changes (clothing, mood, actions) rather than permanent traits
- Use existing character descriptions rather than creating new ones
- Maintain the same personality and emotional tone
- Keep all dialogue and character interactions intact`;
  }

  /**
   * Quick validation check without full correction loop (for performance)
   */
  static async quickValidation(
    response: string,
    context: ValidationContext
  ): Promise<boolean> {
    
    try {
      const fieldUpdates = this.extractFieldUpdates(response);
      
      if (fieldUpdates.length === 0) {
        return true;
      }

      // Only check for immutable field violations (fastest check)
      const validationResults = await CharacterFieldValidator.validateFieldUpdates(
        fieldUpdates,
        context
      );

      return validationResults.every(result => result.allowed);

    } catch (error) {
      console.error('Error in quick validation:', error);
      return true; // Fail open
    }
  }

  /**
   * Apply approved field updates to character state
   */
  static async applyApprovedUpdates(
    response: string,
    context: ValidationContext,
    messageId?: string
  ): Promise<string[]> {
    
    try {
      const fieldUpdates = this.extractFieldUpdates(response);
      
      if (fieldUpdates.length === 0) {
        return [];
      }

      // Add messageId to each update request
      const updatesWithMessageId = fieldUpdates.map(update => ({
        ...update,
        messageId
      }));

      const validationResults = await CharacterFieldValidator.validateFieldUpdates(
        updatesWithMessageId,
        context
      );

      const changeIds: string[] = [];

      for (let i = 0; i < updatesWithMessageId.length; i++) {
        const update = updatesWithMessageId[i];
        const validation = validationResults[i];

        if (validation.allowed) {
          try {
            const changeId = await CharacterFieldValidator.recordFieldChange(
              update,
              context,
              validation
            );
            changeIds.push(changeId);
          } catch (error) {
            console.error('Error recording field change:', error);
          }
        }
      }

      return changeIds;

    } catch (error) {
      console.error('Error applying approved updates:', error);
      return [];
    }
  }

  /**
   * Get validation statistics for monitoring
   */
  static getValidationStats(): {
    totalValidations: number;
    blockedUpdates: number;
    averageProcessingTime: number;
    retryRate: number;
  } {
    // TODO: Implement stats tracking with Redis or in-memory store
    return {
      totalValidations: 0,
      blockedUpdates: 0,
      averageProcessingTime: 0,
      retryRate: 0
    };
  }
}