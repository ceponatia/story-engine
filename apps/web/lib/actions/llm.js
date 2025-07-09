"use server";
import { isAIAvailable } from "@/lib/config/validation";
import { buildCharacterContext } from "./character-state";
import { templateRegistry } from "@story-engine/ai";
import { getAdventureById, getAdventureMessages, createAdventureMessage, } from "@story-engine/postgres";
import { requireAuth } from "@story-engine/auth";
import { getValidationConfigWithUser } from "@/lib/config/response-validation";
import { ValidatedLLMService } from "@/lib/validation/validated-llm-service";
import { enhanceSystemPromptWithTraits, shouldEnhancePrompt } from "@story-engine/ai";
function sanitizeLLMInput(input) {
    return input
        .replace(/<script[^>]*>.*?<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/\[SYSTEM\]/gi, "[USER-SYSTEM]")
        .replace(/\[\/SYSTEM\]/gi, "[/USER-SYSTEM]")
        .replace(/\[ASSISTANT\]/gi, "[USER-ASSISTANT]")
        .replace(/\[\/ASSISTANT\]/gi, "[/USER-ASSISTANT]")
        .trim();
}
export async function generateLLMResponse(adventureId, userMessage) {
    var _a, _b, _c, _d;
    try {
        const { user } = await requireAuth();
        const rateLimit = await RedisManager.checkRateLimit(user.id, 60, 20);
        if (!rateLimit.allowed) {
            return {
                success: false,
                error: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} seconds.`,
                message: null,
            };
        }
        const sanitizedMessage = sanitizeLLMInput(userMessage);
        if (sanitizedMessage.length === 0) {
            return {
                success: false,
                error: "Invalid message content",
                message: null,
            };
        }
        if (!isAIAvailable()) {
            return {
                success: false,
                error: "AI features are currently disabled. Please contact an administrator.",
                message: null,
            };
        }
        const adventure = await getAdventureById(adventureId, user.id);
        if (!adventure) {
            return {
                success: false,
                error: "Adventure not found or not accessible",
                message: null,
            };
        }
        const validationConfig = await getValidationConfigWithUser(adventure.type || "general", user.id);
        const contextWindowSize = validationConfig.contextWindow.default;
        const recentMessages = await getAdventureMessages(adventureId, contextWindowSize);
        let systemPrompt = adventure.system_prompt;
        try {
            const template = await templateRegistry.getTemplateWithContext(adventure.type || "general", user.id);
            if (template) {
                systemPrompt = template.content;
            }
        }
        catch (error) {
            console.warn("Template retrieval failed, using fallback:", error);
        }
        if (!systemPrompt) {
            const enhancedContext = await buildCharacterContext(adventureId);
            systemPrompt = enhancedContext;
        }
        try {
            const recentMessageContents = recentMessages.map((msg) => msg.content);
            if (shouldEnhancePrompt(userMessage, recentMessageContents)) {
                const conversationContext = {
                    messages: recentMessages.map((msg) => ({
                        role: msg.role,
                        content: msg.content,
                        timestamp: new Date(msg.created_at),
                    })),
                    activeAdventureCharacterId: (_b = (_a = adventure.adventure_characters) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id,
                    adventureId: adventureId,
                };
                const enhancement = await enhanceSystemPromptWithTraits(systemPrompt, conversationContext, {
                    lookbackMessages: 5,
                    confidenceThreshold: 0.6,
                    enableFallback: true,
                    timeoutMs: 2000,
                });
                if (enhancement.success && enhancement.traitsInjected.length > 0) {
                    systemPrompt = enhancement.enhancedPrompt;
                    console.log(`Enhanced system prompt with ${enhancement.traitsInjected.length} trait(s): ${enhancement.traitsInjected.join(", ")}`);
                }
                if (enhancement.errors.length > 0) {
                    console.warn("Trait enhancement warnings:", enhancement.errors);
                }
            }
        }
        catch (error) {
            console.warn("Trait enhancement failed, continuing with original prompt:", error);
        }
        const messageHistory = recentMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));
        const adventureCharacterId = (_d = (_c = adventure.adventure_characters) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.id;
        const validatedResponse = await ValidatedLLMService.generateValidatedResponse({
            adventureId,
            userMessage: sanitizedMessage,
            userId: user.id,
            adventure: {
                id: adventure.id,
                adventure_type: adventure.type || "general",
                system_prompt: systemPrompt,
                adventure_characters: adventure.adventure_characters,
            },
            messageHistory,
            adventureCharacterId,
        }, {
            enableValidation: true,
            bypassForAdminUsers: false,
            quickValidationOnly: false,
        });
        if (!validatedResponse.success) {
            return {
                success: false,
                error: validatedResponse.error || "Failed to generate validated response",
                message: null,
            };
        }
        const formattedResponse = validatedResponse.content;
        const assistantMessage = await createAdventureMessage(adventureId, "assistant", formattedResponse, user.id, {
            model: validatedResponse.messageMetadata.model,
            validation_enabled: validatedResponse.messageMetadata.validationEnabled,
            retries_used: validatedResponse.messageMetadata.retriesUsed,
            blocked_updates_count: validatedResponse.messageMetadata.blockedUpdatesCount,
            processing_time_ms: validatedResponse.messageMetadata.processingTimeMs,
            validation_final: validatedResponse.validationResult.finalValidation,
            blocked_updates: validatedResponse.validationResult.blockedUpdates.length > 0
                ? validatedResponse.validationResult.blockedUpdates
                : undefined,
        });
        try {
            const { processLLMResponse, getAutomatedStateConfig } = await import("@story-engine/ai");
            const stateConfig = getAutomatedStateConfig(adventure.type || "general");
            if (stateConfig.enabled &&
                stateConfig.enabledFor[adventure.type] !== false) {
                const stateProcessing = processLLMResponse(formattedResponse, adventureId, user.id, {
                    extractionMode: stateConfig.extractionMode,
                    minConfidence: stateConfig.minConfidence,
                    dryRun: false,
                });
                stateProcessing
                    .then((result) => {
                    var _a, _b;
                    if (result.success && ((_a = result.stateExtraction) === null || _a === void 0 ? void 0 : _a.extractions.length)) {
                        console.log(`State extraction completed: ${result.stateExtraction.extractions.length} changes detected for adventure ${adventureId}`);
                        if ((_b = result.stateUpdate) === null || _b === void 0 ? void 0 : _b.updatesApplied) {
                            console.log(`Applied ${result.stateUpdate.updatesApplied} state updates (${result.stateUpdate.highConfidenceUpdates} high confidence)`);
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
        }
        catch (error) {
            console.warn("State extraction module unavailable:", error);
        }
        return { success: true, message: assistantMessage };
    }
    catch (error) {
        const { DatabaseErrorHandler } = await import("@/lib/postgres/multi-db-manager");
        const safeError = DatabaseErrorHandler.createSafeErrorResponse(error);
        console.error("Error generating LLM response:", Object.assign({ errorCode: safeError.errorCode, timestamp: safeError.timestamp }, (process.env.NODE_ENV !== "production" && { debugInfo: safeError.debugInfo })));
        return {
            success: false,
            error: safeError.error,
            message: null,
        };
    }
}
