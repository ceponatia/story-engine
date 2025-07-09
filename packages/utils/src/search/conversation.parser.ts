// packages/utils/search/conversation.parser.ts

/**
 * Conversation search utilities for parsing and matching conversation content.
 * Provides algorithms for searching through message histories and conversations.
 */

import type {
  ConversationMessage,
  SearchResult,
  SearchOptions,
  TextMatchOptions,
} from "@story-engine/types";
import {
  calculateKeywordSimilarity,
  truncateContent,
  SIMILARITY_THRESHOLDS,
} from "./similarity.parser";

export interface ConversationSearchOptions extends SearchOptions {
  readonly recentMessageLimit?: number;
  readonly includeSystemMessages?: boolean;
  readonly roleFilter?: readonly string[];
  readonly timeRangeHours?: number;
}

export interface ConversationMatch {
  readonly message: ConversationMessage;
  readonly relevanceScore: number;
  readonly matchedSegments: readonly string[];
  readonly context: {
    readonly previousMessage?: ConversationMessage;
    readonly nextMessage?: ConversationMessage;
  };
}

/**
 * Default conversation search settings
 */
export const CONVERSATION_DEFAULTS = {
  RECENT_MESSAGE_LIMIT: 20,
  MIN_RELEVANCE_THRESHOLD: 0.3,
  CONTENT_TRUNCATE_LENGTH: 200,
  CONTEXT_WEIGHT: 0.5, // Lower weight for conversation context vs direct embedding matches
} as const;

/**
 * Searches through conversation messages for relevant content using keyword matching.
 * This is a fallback implementation for when semantic search is not available.
 */
export function searchConversationMessages(
  query: string,
  messages: readonly ConversationMessage[],
  options: ConversationSearchOptions & TextMatchOptions = {}
): readonly ConversationMatch[] {
  // Input validation
  if (typeof query !== "string" || !Array.isArray(messages)) {
    return [];
  }

  const {
    maxResults = 10,
    threshold = CONVERSATION_DEFAULTS.MIN_RELEVANCE_THRESHOLD,
    recentMessageLimit = CONVERSATION_DEFAULTS.RECENT_MESSAGE_LIMIT,
    includeSystemMessages = false,
    roleFilter,
    timeRangeHours,
    ...textMatchOptions
  } = options;

  try {
    // Filter messages based on criteria
    let filteredMessages = [...messages];

    // Filter by role if specified
    if (roleFilter && roleFilter.length > 0) {
      filteredMessages = filteredMessages.filter((msg) => roleFilter.includes(msg.role));
    }

    // Filter out system messages if not included
    if (!includeSystemMessages) {
      filteredMessages = filteredMessages.filter((msg) => msg.role !== "system");
    }

    // Filter by time range if specified
    if (timeRangeHours && timeRangeHours > 0) {
      const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
      filteredMessages = filteredMessages.filter((msg) => new Date(msg.created_at) >= cutoffTime);
    }

    // Limit to recent messages
    if (recentMessageLimit > 0) {
      filteredMessages = filteredMessages
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, recentMessageLimit);
    }

    const matches: ConversationMatch[] = [];

    // Search through filtered messages
    for (let i = 0; i < filteredMessages.length; i++) {
      const message = filteredMessages[i];
      const similarity = calculateKeywordSimilarity(query, message.content, textMatchOptions);

      if (similarity.relevanceScore >= threshold) {
        // Extract context messages
        const previousMessage = i > 0 ? filteredMessages[i - 1] : undefined;
        const nextMessage = i < filteredMessages.length - 1 ? filteredMessages[i + 1] : undefined;

        // Find best matching segments in the message
        const matchedSegments = extractMatchingSegments(
          query,
          message.content,
          similarity.matchedWords
        );

        matches.push({
          message,
          relevanceScore: similarity.relevanceScore * CONVERSATION_DEFAULTS.CONTEXT_WEIGHT,
          matchedSegments,
          context: {
            previousMessage,
            nextMessage,
          },
        });
      }
    }

    // Sort by relevance and limit results
    return matches.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, maxResults);
  } catch (error) {
    console.warn("Conversation search error:", error);
    return [];
  }
}

/**
 * Converts conversation matches to standardized search results.
 */
export function conversationMatchesToSearchResults(
  matches: readonly ConversationMatch[],
  options: {
    contentTruncateLength?: number;
    includeContext?: boolean;
  } = {}
): readonly SearchResult[] {
  const {
    contentTruncateLength = CONVERSATION_DEFAULTS.CONTENT_TRUNCATE_LENGTH,
    includeContext = false,
  } = options;

  try {
    return matches.map((match) => {
      let content = match.message.content;

      // Truncate content if needed
      if (content.length > contentTruncateLength) {
        content = truncateContent(content, contentTruncateLength);
      }

      // Add context if requested
      if (includeContext && (match.context.previousMessage || match.context.nextMessage)) {
        const contextParts: string[] = [content];

        if (match.context.previousMessage) {
          contextParts.unshift(
            `[Previous: ${truncateContent(match.context.previousMessage.content, 50)}]`
          );
        }

        if (match.context.nextMessage) {
          contextParts.push(`[Next: ${truncateContent(match.context.nextMessage.content, 50)}]`);
        }

        content = contextParts.join(" ");
      }

      return {
        type: "conversation_context",
        content,
        relevanceScore: match.relevanceScore,
        metadata: {
          source: "conversation_history",
          messageId: match.message.id,
          timestamp: match.message.created_at,
          role: match.message.role,
          matchedSegments: match.matchedSegments,
          hasContext:
            includeContext && !!(match.context.previousMessage || match.context.nextMessage),
        },
      };
    });
  } catch (error) {
    console.warn("Conversation results conversion error:", error);
    return [];
  }
}

/**
 * Extracts matching text segments from message content.
 */
function extractMatchingSegments(
  query: string,
  content: string,
  matchedWords: readonly string[]
): readonly string[] {
  if (!matchedWords.length || !content) {
    return [];
  }

  try {
    const segments: string[] = [];
    const segmentLength = 80;
    const contentLower = content.toLowerCase();

    for (const word of matchedWords) {
      const wordIndex = contentLower.indexOf(word.toLowerCase());

      if (wordIndex !== -1) {
        const start = Math.max(0, wordIndex - segmentLength / 2);
        const end = Math.min(content.length, wordIndex + word.length + segmentLength / 2);

        let segment = content.slice(start, end);

        // Add ellipsis if we're not at the beginning/end
        if (start > 0) segment = "..." + segment;
        if (end < content.length) segment = segment + "...";

        segments.push(segment);
      }
    }

    // Remove duplicates and limit segments
    return Array.from(new Set(segments)).slice(0, 3);
  } catch (error) {
    console.warn("Segment extraction error:", error);
    return [];
  }
}

/**
 * Groups conversation messages by topic or context for better search organization.
 */
export function groupConversationsByContext(
  messages: readonly ConversationMessage[],
  options: {
    maxGroupSize?: number;
    timeGapMinutes?: number;
    roleChangeGrouping?: boolean;
  } = {}
): Array<{
  readonly messages: readonly ConversationMessage[];
  readonly topic?: string;
  readonly timeSpan: {
    readonly start: string;
    readonly end: string;
  };
}> {
  const { maxGroupSize = 10, timeGapMinutes = 30, roleChangeGrouping = true } = options;

  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  try {
    const groups: Array<{
      messages: ConversationMessage[];
      timeSpan: { start: string; end: string };
    }> = [];

    let currentGroup: ConversationMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const prevMessage = i > 0 ? messages[i - 1] : null;

      // Check if we should start a new group
      const shouldStartNewGroup =
        currentGroup.length >= maxGroupSize ||
        (prevMessage && roleChangeGrouping && message.role !== prevMessage.role) ||
        (prevMessage &&
          new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() >
            timeGapMinutes * 60 * 1000);

      if (shouldStartNewGroup && currentGroup.length > 0) {
        groups.push({
          messages: [...currentGroup],
          timeSpan: {
            start: currentGroup[0].created_at,
            end: currentGroup[currentGroup.length - 1].created_at,
          },
        });
        currentGroup = [];
      }

      currentGroup.push(message);
    }

    // Add the last group if it has messages
    if (currentGroup.length > 0) {
      groups.push({
        messages: currentGroup,
        timeSpan: {
          start: currentGroup[0].created_at,
          end: currentGroup[currentGroup.length - 1].created_at,
        },
      });
    }

    return groups;
  } catch (error) {
    console.warn("Conversation grouping error:", error);
    return [];
  }
}
