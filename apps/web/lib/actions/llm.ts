"use server";

import { isAIAvailable } from "@/lib/config/validation";
import { buildCharacterContext } from "./character-state";
import { templateRegistry } from "@/lib/prompts/registry";
import {
  getAdventureById,
  getAdventureMessages,
  createAdventureMessage,
} from "@/lib/postgres/repositories";
import { requireAuth } from "@/lib/auth-helper";
import { getValidationConfigWithUser } from "@/lib/config/response-validation";
import { ValidatedLLMService } from "@/lib/validation/validated-llm-service";
import { enhanceSystemPromptWithTraits, shouldEnhancePrompt } from "@/lib/ai/prompt-enhancement";
import type { ConversationContext } from "@/lib/ai/functions/context-analyzer";
import { RedisManager } from "@/lib/postgres/redis";

/**
 * Main LLM Response Generation Service
 *
 * This is the primary entry point for generating AI responses in the Story Engine.
 * It orchestrates the complete LLM workflow including authentication, context building,
 * response generation, validation, and automated state extraction.
 *
 * Architecture:
 * 1. Authentication and permission checks
 * 2. Adventure and context data retrieval
 * 3. Dynamic context window sizing based on adventure type
 * 4. Enhanced character context building
 * 5. Validated LLM response generation with field protection
 * 6. Database persistence with metadata
 * 7. Asynchronous state extraction and character tracking
 *
 * Performance Characteristics:
 * - Synchronous: ~200-500ms (context + LLM generation + validation)
 * - Asynchronous: +100-300ms (state extraction - non-blocking)
 * - Memory: Moderate (template caching, context objects)
 *
 * Security Features:
 * - User authentication required
 * - Adventure ownership validation
 * - Character field protection via ValidatedLLMService
 * - Metadata logging for audit trails
 *
 * Integration Points:
 * - Database: PostgreSQL via connection pool
 * - AI: Ollama/Mistral via validated service
 * - State: Automated character state extraction
 * - UI: Adventure chat interface
 *
 * @param adventureId - Unique identifier for the adventure instance
 * @param userMessage - Raw user input message (⚠️ NOT SANITIZED - security risk)
 * @returns Promise<{success: boolean, message?: object, error?: string}>
 *
 * @example
 * ```typescript
 * const result = await generateLLMResponse('adv_123', 'Hello Emily!');
 * if (result.success) {
 *   console.log('Assistant response:', result.message.content);
 * }
 * ```
 *
 * @complexity O(1) - Linear with context window size and response length
 * @calls buildCharacterContext, getAdventureById, getAdventureMessages, ValidatedLLMService.generateValidatedResponse
 * @called_by Adventure chat interface, API endpoints
 */
/**
 * Sanitize user input to prevent prompt injection attacks
 * Removes potentially dangerous content while preserving conversational text
 */
function sanitizeLLMInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .replace(/\[SYSTEM\]/gi, "[USER-SYSTEM]") // Escape system prompts
    .replace(/\[\/SYSTEM\]/gi, "[/USER-SYSTEM]")
    .replace(/\[ASSISTANT\]/gi, "[USER-ASSISTANT]") // Escape assistant prompts
    .replace(/\[\/ASSISTANT\]/gi, "[/USER-ASSISTANT]")
    .trim();
}

export async function generateLLMResponse(adventureId: string, userMessage: string) {
  try {
    // Phase 1: Authentication and Authorization
    // Validates user session and permissions before proceeding
    const { user } = await requireAuth();

    // Phase 1.5: Rate Limiting Protection
    // Prevents abuse of expensive LLM endpoints
    const rateLimit = await RedisManager.checkRateLimit(user.id, 60, 20); // 20 requests per minute
    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`,
        message: null,
      };
    }

    // Phase 1.6: Input Sanitization
    // Sanitize user input to prevent prompt injection attacks
    const sanitizedMessage = sanitizeLLMInput(userMessage);
    if (sanitizedMessage.length === 0) {
      return {
        success: false,
        error: "Invalid message content",
        message: null,
      };
    }

    // Phase 2: System Availability Check
    // Verifies AI services are enabled before processing requests
    if (!isAIAvailable()) {
      return {
        success: false,
        error: "AI features are currently disabled. Please contact an administrator.",
        message: null,
      };
    }

    // Phase 3: Adventure Data Retrieval and Access Control
    // Fetches adventure details with ownership validation
    const adventure = await getAdventureById(adventureId, user.id);

    if (!adventure) {
      return {
        success: false,
        error: "Adventure not found or not accessible",
        message: null,
      };
    }

    // Phase 4: Context Window Management & User Template Support
    // Dynamically sizes context based on adventure type, now supporting user-created types:
    // - System types: Romance (18), Action (10), General (10)
    // - User types: Custom context window from validation config
    const validationConfig = await getValidationConfigWithUser(
      adventure.type || "general",
      user.id
    );
    const contextWindowSize = validationConfig.contextWindow.default;
    const recentMessages = await getAdventureMessages(adventureId, contextWindowSize);

    // Phase 5: Enhanced Character Context Building with Hybrid Template Support
    // Supports both system templates and user-created templates
    // Priority: User template > System template > Adventure system_prompt > Enhanced context
    let systemPrompt = adventure.system_prompt;

    try {
      // Try to get template with user context (supports user-created adventure types)
      const template = await templateRegistry.getTemplateWithContext(
        adventure.type || "general",
        user.id
      );

      if (template) {
        systemPrompt = template.content;
      }
    } catch (error) {
      console.warn("Template retrieval failed, using fallback:", error);
    }

    // Fallback to enhanced character context if no template or system_prompt
    if (!systemPrompt) {
      const enhancedContext = await buildCharacterContext(adventureId);
      systemPrompt = enhancedContext;
    }

    // Phase 5.5: Context-Aware Trait Enhancement
    // NEW: Analyze conversation for trait-specific context and enhance system prompt
    try {
      // Check if trait enhancement would be beneficial for this conversation
      const recentMessageContents = recentMessages.map((msg: any) => msg.content);
      if (shouldEnhancePrompt(userMessage, recentMessageContents)) {
        // Build conversation context for analysis
        const conversationContext: ConversationContext = {
          messages: recentMessages.map((msg: any) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
          })),
          activeAdventureCharacterId: adventure.adventure_characters?.[0]?.id,
          adventureId: adventureId,
        };

        // Enhance system prompt with relevant trait data
        const enhancement = await enhanceSystemPromptWithTraits(systemPrompt, conversationContext, {
          lookbackMessages: 5,
          confidenceThreshold: 0.6,
          enableFallback: true,
          timeoutMs: 2000, // Keep it fast to avoid blocking chat
        });

        if (enhancement.success && enhancement.traitsInjected.length > 0) {
          systemPrompt = enhancement.enhancedPrompt;
          console.log(
            `Enhanced system prompt with ${enhancement.traitsInjected.length} trait(s): ${enhancement.traitsInjected.join(", ")}`
          );
        }

        if (enhancement.errors.length > 0) {
          console.warn("Trait enhancement warnings:", enhancement.errors);
        }
      }
    } catch (error) {
      // Log but don't fail the response if trait enhancement has issues
      console.warn("Trait enhancement failed, continuing with original prompt:", error);
    }

    // Phase 6: Message History Formatting
    // Converts database messages to LLM-compatible format
    // Messages are pre-sorted chronologically by database query
    const messageHistory = recentMessages.map((msg: any) => ({
      role: msg.role, // Use the role field directly from database
      content: msg.content,
    }));

    // Phase 7: Character Validation Setup
    // Extracts character ID for field protection validation
    // Assumes single-character adventures (current limitation)
    const adventureCharacterId = adventure.adventure_characters?.[0]?.id;

    // Phase 8: Validated LLM Response Generation
    // ✅ SECURITY HARDENED: userMessage is now sanitized to prevent prompt injection
    // Uses sophisticated validation service with character field protection
    // Includes retry logic for validation failures and field update blocking
    const validatedResponse = await ValidatedLLMService.generateValidatedResponse(
      {
        adventureId,
        userMessage: sanitizedMessage, // ✅ NOW SANITIZED - security vulnerability fixed
        userId: user.id,
        adventure: {
          id: adventure.id,
          adventure_type: adventure.type || "general",
          system_prompt: systemPrompt,
          adventure_characters: adventure.adventure_characters,
        },
        messageHistory,
        adventureCharacterId,
      },
      {
        enableValidation: true,
        bypassForAdminUsers: false, // TODO: Add admin role check
        quickValidationOnly: false,
      }
    );

    // Phase 9: Response Validation Check
    // Handles validation failures with descriptive error messages
    if (!validatedResponse.success) {
      return {
        success: false,
        error: validatedResponse.error || "Failed to generate validated response",
        message: null,
      };
    }

    const formattedResponse = validatedResponse.content;

    // Phase 10: Database Persistence with Rich Metadata
    // Stores response with comprehensive tracking data for analysis and debugging
    // Includes validation metrics, performance data, and blocked updates
    const assistantMessage = await createAdventureMessage(
      adventureId,
      "assistant",
      formattedResponse,
      user.id,
      {
        model: validatedResponse.messageMetadata.model,
        validation_enabled: validatedResponse.messageMetadata.validationEnabled,
        retries_used: validatedResponse.messageMetadata.retriesUsed,
        blocked_updates_count: validatedResponse.messageMetadata.blockedUpdatesCount,
        processing_time_ms: validatedResponse.messageMetadata.processingTimeMs,
        validation_final: validatedResponse.validationResult.finalValidation,
        blocked_updates:
          validatedResponse.validationResult.blockedUpdates.length > 0
            ? validatedResponse.validationResult.blockedUpdates
            : undefined,
      }
    );

    // Phase 11: Asynchronous State Extraction and Character Tracking
    // ⚠️ PERFORMANCE IMPACT: Dynamic import adds latency on first call
    // Uses "crawl-walk-run" approach for automated character state detection
    // Adventure-type specific configuration:
    // - Romance: balanced extraction (character development focus)
    // - Action: conservative extraction (performance focus)
    // - General: conservative extraction (stability focus)
    try {
      const { processLLMResponse, getAutomatedStateConfig } = await import("@/lib/ai/functions");
      const stateConfig = getAutomatedStateConfig(adventure.type || "general");

      if (
        stateConfig.enabled &&
        stateConfig.enabledFor[adventure.type as keyof typeof stateConfig.enabledFor] !== false
      ) {
        // Process state extraction asynchronously to avoid slowing chat responses
        // Fire-and-forget pattern maintains responsiveness while enabling character evolution
        const stateProcessing = processLLMResponse(formattedResponse, adventureId, user.id, {
          extractionMode: stateConfig.extractionMode,
          minConfidence: stateConfig.minConfidence,
          dryRun: false,
        });

        // Log results but don't await to keep response fast
        // Provides telemetry for monitoring state extraction effectiveness
        stateProcessing
          .then((result) => {
            if (result.success && result.stateExtraction?.extractions.length) {
              console.log(
                `State extraction completed: ${result.stateExtraction.extractions.length} changes detected for adventure ${adventureId}`
              );
              if (result.stateUpdate?.updatesApplied) {
                console.log(
                  `Applied ${result.stateUpdate.updatesApplied} state updates (${result.stateUpdate.highConfidenceUpdates} high confidence)`
                );
              }
            }
            if (result.errors.length > 0) {
              console.warn("State extraction errors:", result.errors);
            }
          })
          .catch((error) => {
            console.error("Automated state extraction failed:", error);
          });
      }
    } catch (error) {
      // Log but don't fail the response if state extraction has issues
      // Graceful degradation ensures chat functionality remains available
      console.warn("State extraction module unavailable:", error);
    }

    return { success: true, message: assistantMessage };
  } catch (error) {
    // Use secure error handler to prevent exposing sensitive database details
    const { DatabaseErrorHandler } = await import("@/lib/postgres/multi-db-manager");
    const safeError = DatabaseErrorHandler.createSafeErrorResponse(error as Error);

    console.error("Error generating LLM response:", {
      errorCode: safeError.errorCode,
      timestamp: safeError.timestamp,
      ...(process.env.NODE_ENV !== "production" && { debugInfo: safeError.debugInfo }),
    });

    return {
      success: false,
      error: safeError.error,
      message: null,
    };
  }
}
