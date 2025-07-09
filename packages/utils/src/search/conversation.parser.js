var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { calculateKeywordSimilarity, truncateContent, } from "./similarity.parser";
export const CONVERSATION_DEFAULTS = {
    RECENT_MESSAGE_LIMIT: 20,
    MIN_RELEVANCE_THRESHOLD: 0.3,
    CONTENT_TRUNCATE_LENGTH: 200,
    CONTEXT_WEIGHT: 0.5,
};
export function searchConversationMessages(query, messages, options = {}) {
    if (typeof query !== "string" || !Array.isArray(messages)) {
        return [];
    }
    const { maxResults = 10, threshold = CONVERSATION_DEFAULTS.MIN_RELEVANCE_THRESHOLD, recentMessageLimit = CONVERSATION_DEFAULTS.RECENT_MESSAGE_LIMIT, includeSystemMessages = false, roleFilter, timeRangeHours } = options, textMatchOptions = __rest(options, ["maxResults", "threshold", "recentMessageLimit", "includeSystemMessages", "roleFilter", "timeRangeHours"]);
    try {
        let filteredMessages = [...messages];
        if (roleFilter && roleFilter.length > 0) {
            filteredMessages = filteredMessages.filter((msg) => roleFilter.includes(msg.role));
        }
        if (!includeSystemMessages) {
            filteredMessages = filteredMessages.filter((msg) => msg.role !== "system");
        }
        if (timeRangeHours && timeRangeHours > 0) {
            const cutoffTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
            filteredMessages = filteredMessages.filter((msg) => new Date(msg.created_at) >= cutoffTime);
        }
        if (recentMessageLimit > 0) {
            filteredMessages = filteredMessages
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, recentMessageLimit);
        }
        const matches = [];
        for (let i = 0; i < filteredMessages.length; i++) {
            const message = filteredMessages[i];
            const similarity = calculateKeywordSimilarity(query, message.content, textMatchOptions);
            if (similarity.relevanceScore >= threshold) {
                const previousMessage = i > 0 ? filteredMessages[i - 1] : undefined;
                const nextMessage = i < filteredMessages.length - 1 ? filteredMessages[i + 1] : undefined;
                const matchedSegments = extractMatchingSegments(query, message.content, similarity.matchedWords);
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
        return matches.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, maxResults);
    }
    catch (error) {
        console.warn("Conversation search error:", error);
        return [];
    }
}
export function conversationMatchesToSearchResults(matches, options = {}) {
    const { contentTruncateLength = CONVERSATION_DEFAULTS.CONTENT_TRUNCATE_LENGTH, includeContext = false, } = options;
    try {
        return matches.map((match) => {
            let content = match.message.content;
            if (content.length > contentTruncateLength) {
                content = truncateContent(content, contentTruncateLength);
            }
            if (includeContext && (match.context.previousMessage || match.context.nextMessage)) {
                const contextParts = [content];
                if (match.context.previousMessage) {
                    contextParts.unshift(`[Previous: ${truncateContent(match.context.previousMessage.content, 50)}]`);
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
                    hasContext: includeContext && !!(match.context.previousMessage || match.context.nextMessage),
                },
            };
        });
    }
    catch (error) {
        console.warn("Conversation results conversion error:", error);
        return [];
    }
}
function extractMatchingSegments(query, content, matchedWords) {
    if (!matchedWords.length || !content) {
        return [];
    }
    try {
        const segments = [];
        const segmentLength = 80;
        const contentLower = content.toLowerCase();
        for (const word of matchedWords) {
            const wordIndex = contentLower.indexOf(word.toLowerCase());
            if (wordIndex !== -1) {
                const start = Math.max(0, wordIndex - segmentLength / 2);
                const end = Math.min(content.length, wordIndex + word.length + segmentLength / 2);
                let segment = content.slice(start, end);
                if (start > 0)
                    segment = "..." + segment;
                if (end < content.length)
                    segment = segment + "...";
                segments.push(segment);
            }
        }
        return Array.from(new Set(segments)).slice(0, 3);
    }
    catch (error) {
        console.warn("Segment extraction error:", error);
        return [];
    }
}
export function groupConversationsByContext(messages, options = {}) {
    const { maxGroupSize = 10, timeGapMinutes = 30, roleChangeGrouping = true } = options;
    if (!Array.isArray(messages) || messages.length === 0) {
        return [];
    }
    try {
        const groups = [];
        let currentGroup = [];
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const prevMessage = i > 0 ? messages[i - 1] : null;
            const shouldStartNewGroup = currentGroup.length >= maxGroupSize ||
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
    }
    catch (error) {
        console.warn("Conversation grouping error:", error);
        return [];
    }
}
