import type { TextMatchOptions } from "../../types/search";
export interface SimilarityMatch {
    readonly content: string;
    readonly score: number;
    readonly matchType: "exact" | "partial" | "fuzzy";
    readonly matchedTerms: readonly string[];
}
export interface KeywordMatchResult {
    readonly matchCount: number;
    readonly totalWords: number;
    readonly relevanceScore: number;
    readonly matchedWords: readonly string[];
}
export declare const SIMILARITY_THRESHOLDS: {
    readonly EXACT_MATCH: 1;
    readonly HIGH_SIMILARITY: 0.8;
    readonly MODERATE_SIMILARITY: 0.6;
    readonly LOW_SIMILARITY: 0.3;
    readonly MINIMUM_THRESHOLD: 0.1;
};
export declare function calculateKeywordSimilarity(query: string, content: string, options?: TextMatchOptions): KeywordMatchResult;
export declare function calculateJaccardSimilarity(text1: string, text2: string): number;
export declare function truncateContent(content: string, maxLength?: number): string;
export declare function extractBestMatches(query: string, content: string, options?: {
    maxSegments?: number;
    segmentLength?: number;
    contextPadding?: number;
}): Array<{
    segment: string;
    score: number;
    startIndex: number;
}>;
export declare function combineSimilarityScores(scores: Array<{
    score: number;
    weight: number;
}>): number;
//# sourceMappingURL=similarity.parser.d.ts.map