/**
 * RAG Context Enhancer for Story Engine
 *
 * Enhances LLM prompts with relevant character information using similarity search
 * and vector embeddings to maintain character consistency across conversations.
 *
 * Phase 4: Context Enhancement with RAG Memory
 */

import { getContextualCharacterData, performSimilaritySearch } from "./character.search";
import { buildCharacterContext } from "@/lib/actions/character-state";
import { getAdventureMessages } from "../postgres/repositories";
import { EMBEDDING_FEATURES } from "./config/embeddings";

export interface EnhancedContext {
  baseCharacterContext: string;
  relevantTraits: string[];
  conversationMemory: string[];
  similarityInsights: string[];
  enhancementMetadata: {
    traitsFound: number;
    memoryContexts: number;
    processingTime: number;
    ragEnabled: boolean;
  };
}

export interface ContextEnhancementOptions {
  includeRecentMessages?: number;
  maxRelevantTraits?: number;
  similarityThreshold?: number;
  enableRAGMemory?: boolean;
  conversationAnalysis?: boolean;
}

/**
 * Enhance character context for LLM prompts using RAG
 */
export async function enhanceCharacterContext(
  adventureId: string,
  userMessage: string,
  options: ContextEnhancementOptions = {}
): Promise<EnhancedContext> {
  const startTime = Date.now();

  const {
    includeRecentMessages = 5,
    maxRelevantTraits = 3,
    similarityThreshold = 0.8,
    enableRAGMemory = EMBEDDING_FEATURES.CONVERSATION_MEMORY,
    conversationAnalysis = true,
  } = options;

  try {
    // Build base character context
    const baseContext = await buildCharacterContext(adventureId);

    // Initialize enhanced context
    const enhancedContext: EnhancedContext = {
      baseCharacterContext: baseContext,
      relevantTraits: [],
      conversationMemory: [],
      similarityInsights: [],
      enhancementMetadata: {
        traitsFound: 0,
        memoryContexts: 0,
        processingTime: 0,
        ragEnabled: enableRAGMemory,
      },
    };

    // Early return if RAG features are disabled
    if (!enableRAGMemory) {
      enhancedContext.enhancementMetadata.processingTime = Date.now() - startTime;
      return enhancedContext;
    }

    // Get contextual character data using similarity search
    const contextualData = await getContextualCharacterData(adventureId, userMessage, {
      maxTraits: maxRelevantTraits,
      includeConversationContext: conversationAnalysis,
    });

    enhancedContext.relevantTraits = contextualData.relevantTraits;
    enhancedContext.conversationMemory = contextualData.conversationContext;
    enhancedContext.enhancementMetadata.traitsFound = contextualData.relevantTraits.length;
    enhancedContext.enhancementMetadata.memoryContexts = contextualData.conversationContext.length;

    // Generate similarity insights
    if (enhancedContext.relevantTraits.length > 0) {
      enhancedContext.similarityInsights = generateSimilarityInsights(
        userMessage,
        enhancedContext.relevantTraits
      );
    }

    enhancedContext.enhancementMetadata.processingTime = Date.now() - startTime;
    return enhancedContext;
  } catch (error) {
    console.error("Context enhancement failed:", error);

    // Return basic context on error
    const basicContext = await buildCharacterContext(adventureId).catch(() => "");

    return {
      baseCharacterContext: basicContext,
      relevantTraits: [],
      conversationMemory: [],
      similarityInsights: [],
      enhancementMetadata: {
        traitsFound: 0,
        memoryContexts: 0,
        processingTime: Date.now() - startTime,
        ragEnabled: false,
      },
    };
  }
}

/**
 * Format enhanced context for LLM prompt inclusion
 */
export function formatEnhancedContextForPrompt(context: EnhancedContext): string {
  const sections = [];

  // Base character information
  if (context.baseCharacterContext.trim()) {
    sections.push(`## Character Foundation\n${context.baseCharacterContext}`);
  }

  // Relevant traits from similarity search
  if (context.relevantTraits.length > 0) {
    sections.push(
      `## Contextually Relevant Traits\n${context.relevantTraits.map((trait) => `• ${trait}`).join("\n")}`
    );
  }

  // Conversation memory context
  if (context.conversationMemory.length > 0) {
    sections.push(
      `## Recent Conversation Context\n${context.conversationMemory.map((memory) => `• ${memory}`).join("\n")}`
    );
  }

  // Similarity insights
  if (context.similarityInsights.length > 0) {
    sections.push(
      `## Character Consistency Notes\n${context.similarityInsights.map((insight) => `• ${insight}`).join("\n")}`
    );
  }

  return sections.join("\n\n");
}

/**
 * Generate insights about character consistency based on similarity search
 */
function generateSimilarityInsights(userMessage: string, relevantTraits: string[]): string[] {
  const insights: string[] = [];

  // Analyze user message for character-relevant keywords
  const messageWords = userMessage.toLowerCase().split(/\s+/);
  const characterKeywords = [
    "appearance",
    "looks",
    "personality",
    "behavior",
    "scent",
    "aroma",
    "hair",
    "eyes",
    "skin",
    "height",
    "build",
    "clothing",
    "shy",
    "confident",
    "nervous",
    "happy",
    "sad",
    "angry",
  ];

  const foundKeywords = messageWords.filter((word) =>
    characterKeywords.some((keyword) => word.includes(keyword))
  );

  if (foundKeywords.length > 0) {
    insights.push(
      `User message references character aspects: ${foundKeywords.join(", ")}. ` +
        `Maintain consistency with established traits.`
    );
  }

  if (relevantTraits.length > 0) {
    insights.push(
      `Found ${relevantTraits.length} relevant character trait(s) from previous interactions. ` +
        `Ensure responses align with these established characteristics.`
    );
  }

  return insights;
}

/**
 * Analyze conversation for character consistency issues
 */
export async function analyzeCharacterConsistency(
  adventureId: string,
  recentMessages: number = 10
): Promise<{
  consistencyScore: number;
  potentialIssues: string[];
  recommendations: string[];
}> {
  try {
    const messages = await getAdventureMessages(adventureId, recentMessages);
    const characterMessages = messages.filter((msg: any) => msg.role === "assistant");

    if (characterMessages.length < 2) {
      return {
        consistencyScore: 1.0,
        potentialIssues: [],
        recommendations: ["Insufficient conversation history for consistency analysis"],
      };
    }

    // Perform similarity analysis between character messages
    const consistencyAnalysis = await analyzeMessageConsistency(characterMessages);

    return consistencyAnalysis;
  } catch (error) {
    console.error("Character consistency analysis failed:", error);
    return {
      consistencyScore: 0.5,
      potentialIssues: ["Analysis failed due to technical error"],
      recommendations: ["Manual review recommended"],
    };
  }
}

/**
 * Analyze consistency between character messages
 */
async function analyzeMessageConsistency(
  messages: Array<{ content: string; created_at: string }>
): Promise<{
  consistencyScore: number;
  potentialIssues: string[];
  recommendations: string[];
}> {
  // Simple text-based analysis as placeholder
  // TODO: Implement embedding-based consistency analysis

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for obvious inconsistencies in first-person references
  const firstPersonPatterns = [/I am/, /I'm/, /my/, /me/];
  const thirdPersonPatterns = [/she is/, /he is/, /they are/, /her/, /his/, /their/];

  let firstPersonCount = 0;
  let thirdPersonCount = 0;

  for (const message of messages) {
    if (firstPersonPatterns.some((pattern) => pattern.test(message.content))) {
      firstPersonCount++;
    }
    if (thirdPersonPatterns.some((pattern) => pattern.test(message.content))) {
      thirdPersonCount++;
    }
  }

  if (firstPersonCount > 0 && thirdPersonCount > 0) {
    issues.push("Mixed first-person and third-person narrative detected");
    recommendations.push(
      "Maintain consistent narrative voice (first-person recommended for character roleplay)"
    );
  }

  // Calculate basic consistency score
  const totalMessages = messages.length;
  const issueRate = issues.length / Math.max(totalMessages, 1);
  const consistencyScore = Math.max(0, 1 - issueRate);

  return {
    consistencyScore,
    potentialIssues: issues,
    recommendations,
  };
}

/**
 * Get RAG-enhanced system prompt for character conversations
 */
export async function buildRAGEnhancedSystemPrompt(
  adventureId: string,
  baseSystemPrompt: string,
  userMessage: string
): Promise<string> {
  try {
    const enhancedContext = await enhanceCharacterContext(adventureId, userMessage);
    const contextText = formatEnhancedContextForPrompt(enhancedContext);

    if (!contextText.trim()) {
      return baseSystemPrompt;
    }

    return `${baseSystemPrompt}

# Enhanced Character Context (RAG)
${contextText}

Remember to maintain consistency with the above character information and conversation history.`;
  } catch (error) {
    console.error("Failed to build RAG-enhanced system prompt:", error);
    return baseSystemPrompt;
  }
}
