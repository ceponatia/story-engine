export const SIMILARITY_THRESHOLDS = {
    EXACT_MATCH: 1.0,
    HIGH_SIMILARITY: 0.8,
    MODERATE_SIMILARITY: 0.6,
    LOW_SIMILARITY: 0.3,
    MINIMUM_THRESHOLD: 0.1,
};
export function calculateKeywordSimilarity(query, content, options = {}) {
    if (typeof query !== "string" || typeof content !== "string") {
        return {
            matchCount: 0,
            totalWords: 0,
            relevanceScore: 0,
            matchedWords: [],
        };
    }
    const { caseSensitive = false, wholeWords = false, minMatchThreshold = SIMILARITY_THRESHOLDS.MINIMUM_THRESHOLD, } = options;
    try {
        const normalizedQuery = caseSensitive ? query : query.toLowerCase();
        const normalizedContent = caseSensitive ? content : content.toLowerCase();
        const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0);
        if (queryWords.length === 0) {
            return {
                matchCount: 0,
                totalWords: 0,
                relevanceScore: 0,
                matchedWords: [],
            };
        }
        const matchedWords = [];
        for (const word of queryWords) {
            const isMatch = wholeWords
                ? new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(normalizedContent)
                : normalizedContent.includes(word);
            if (isMatch) {
                matchedWords.push(word);
            }
        }
        const matchCount = matchedWords.length;
        const relevanceScore = matchCount / queryWords.length;
        return {
            matchCount,
            totalWords: queryWords.length,
            relevanceScore: relevanceScore >= minMatchThreshold ? relevanceScore : 0,
            matchedWords,
        };
    }
    catch (error) {
        console.warn("Keyword similarity calculation error:", error);
        return {
            matchCount: 0,
            totalWords: 0,
            relevanceScore: 0,
            matchedWords: [],
        };
    }
}
export function calculateJaccardSimilarity(text1, text2) {
    if (typeof text1 !== "string" || typeof text2 !== "string") {
        return 0;
    }
    try {
        const tokens1 = new Set(text1
            .toLowerCase()
            .split(/\s+/)
            .filter((token) => token.length > 0));
        const tokens2 = new Set(text2
            .toLowerCase()
            .split(/\s+/)
            .filter((token) => token.length > 0));
        if (tokens1.size === 0 && tokens2.size === 0) {
            return 1.0;
        }
        if (tokens1.size === 0 || tokens2.size === 0) {
            return 0.0;
        }
        const intersection = new Set(Array.from(tokens1).filter((x) => tokens2.has(x)));
        const union = new Set([...Array.from(tokens1), ...Array.from(tokens2)]);
        return intersection.size / union.size;
    }
    catch (error) {
        console.warn("Jaccard similarity calculation error:", error);
        return 0;
    }
}
export function truncateContent(content, maxLength = 200) {
    if (typeof content !== "string" || maxLength <= 0) {
        return "";
    }
    if (content.length <= maxLength) {
        return content;
    }
    try {
        const truncated = content.slice(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(" ");
        if (lastSpaceIndex > maxLength * 0.7) {
            return truncated.slice(0, lastSpaceIndex) + "...";
        }
        else {
            return truncated + "...";
        }
    }
    catch (error) {
        console.warn("Content truncation error:", error);
        return content.slice(0, maxLength) + "...";
    }
}
export function extractBestMatches(query, content, options = {}) {
    const { maxSegments = 3, segmentLength = 100, contextPadding = 20 } = options;
    if (typeof query !== "string" || typeof content !== "string") {
        return [];
    }
    try {
        const queryWords = query
            .toLowerCase()
            .split(/\s+/)
            .filter((word) => word.length > 0);
        const segments = [];
        for (let i = 0; i < content.length - segmentLength; i += segmentLength / 2) {
            const segment = content.slice(i, i + segmentLength);
            const similarity = calculateKeywordSimilarity(query, segment);
            if (similarity.relevanceScore > 0) {
                segments.push({
                    segment: content.slice(Math.max(0, i - contextPadding), Math.min(content.length, i + segmentLength + contextPadding)),
                    score: similarity.relevanceScore,
                    startIndex: i,
                });
            }
        }
        return segments.sort((a, b) => b.score - a.score).slice(0, maxSegments);
    }
    catch (error) {
        console.warn("Best match extraction error:", error);
        return [];
    }
}
export function combineSimilarityScores(scores) {
    if (!Array.isArray(scores) || scores.length === 0) {
        return 0;
    }
    try {
        const totalWeight = scores.reduce((sum, item) => sum + item.weight, 0);
        if (totalWeight === 0) {
            return 0;
        }
        const weightedSum = scores.reduce((sum, item) => sum + item.score * item.weight, 0);
        return weightedSum / totalWeight;
    }
    catch (error) {
        console.warn("Score combination error:", error);
        return 0;
    }
}
