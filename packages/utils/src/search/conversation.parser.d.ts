import type {
  ConversationMessage,
  SearchResult,
  SearchOptions,
  TextMatchOptions,
} from "@story-engine/types";
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
export declare const CONVERSATION_DEFAULTS: {
  readonly RECENT_MESSAGE_LIMIT: 20;
  readonly MIN_RELEVANCE_THRESHOLD: 0.3;
  readonly CONTENT_TRUNCATE_LENGTH: 200;
  readonly CONTEXT_WEIGHT: 0.5;
};
export declare function searchConversationMessages(
  query: string,
  messages: readonly ConversationMessage[],
  options?: ConversationSearchOptions & TextMatchOptions
): readonly ConversationMatch[];
export declare function conversationMatchesToSearchResults(
  matches: readonly ConversationMatch[],
  options?: {
    contentTruncateLength?: number;
    includeContext?: boolean;
  }
): readonly SearchResult[];
export declare function groupConversationsByContext(
  messages: readonly ConversationMessage[],
  options?: {
    maxGroupSize?: number;
    timeGapMinutes?: number;
    roleChangeGrouping?: boolean;
  }
): Array<{
  readonly messages: readonly ConversationMessage[];
  readonly topic?: string;
  readonly timeSpan: {
    readonly start: string;
    readonly end: string;
  };
}>;
//# sourceMappingURL=conversation.parser.d.ts.map
