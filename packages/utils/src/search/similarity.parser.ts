// packages/utils/search/similarity.parser.ts

/**
 * Text similarity parsing utilities for semantic and keyword-based matching.
 * Provides algorithms for calculating text similarity and relevance scores.
 */

import type { TextMatchOptions, SearchResult } from "@story-engine/types";

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

/**
 * Default similarity thresholds for different match types
 */
export const SIMILARITY_THRESHOLDS = {
  EXACT_MATCH: 1.0,
  HIGH_SIMILARITY: 0.8,
  MODERATE_SIMILARITY: 0.6,
  LOW_SIMILARITY: 0.3,
  MINIMUM_THRESHOLD: 0.1,
} as const;

/**
 * Performs basic keyword matching between query and content.
 * Used as a fallback when semantic search is not available.
 */
export function calculateKeywordSimilarity(
  query: string,
  content: string,
  options: TextMatchOptions = {}
): KeywordMatchResult {
  // Input validation
  if (typeof query !== "string" || typeof content !== "string") {
    return {
      matchCount: 0,
      totalWords: 0,
      relevanceScore: 0,
      matchedWords: [],
    };
  }

  const {
    caseSensitive = false,
    wholeWords = false,
    minMatchThreshold = SIMILARITY_THRESHOLDS.MINIMUM_THRESHOLD,
  } = options;

  try {
    // Normalize text based on case sensitivity
    const normalizedQuery = caseSensitive ? query : query.toLowerCase();
    const normalizedContent = caseSensitive ? content : content.toLowerCase();

    // Split query into words
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 0);

    if (queryWords.length === 0) {
      return {
        matchCount: 0,
        totalWords: 0,
        relevanceScore: 0,
        matchedWords: [],
      };
    }

    // Find matching words
    const matchedWords: string[] = [];

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
  } catch (error) {
    console.warn("Keyword similarity calculation error:", error);
    return {
      matchCount: 0,
      totalWords: 0,
      relevanceScore: 0,
      matchedWords: [],
    };
  }
}

/**
 * Calculates Jaccard similarity between two text strings.
 * Useful for comparing documents or longer text passages.
 */
export function calculateJaccardSimilarity(text1: string, text2: string): number {
  if (typeof text1 !== "string" || typeof text2 !== "string") {
    return 0;
  }

  try {
    // Normalize and tokenize
    const tokens1 = new Set(
      text1
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 0)
    );
    const tokens2 = new Set(
      text2
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 0)
    );

    if (tokens1.size === 0 && tokens2.size === 0) {
      return 1.0; // Both empty texts are identical
    }

    if (tokens1.size === 0 || tokens2.size === 0) {
      return 0.0; // One empty, one not
    }

    // Calculate intersection and union
    const intersection = new Set(Array.from(tokens1).filter((x) => tokens2.has(x)));
    const union = new Set([...Array.from(tokens1), ...Array.from(tokens2)]);

    return intersection.size / union.size;
  } catch (error) {
    console.warn("Jaccard similarity calculation error:", error);
    return 0;
  }
}

/**
 * Truncates content to a specified length while preserving word boundaries.
 */
export function truncateContent(content: string, maxLength: number = 200): string {
  if (typeof content !== "string" || maxLength <= 0) {
    return "";
  }

  if (content.length <= maxLength) {
    return content;
  }

  try {
    // Find the last complete word within the limit
    const truncated = content.slice(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > maxLength * 0.7) {
      // If we can preserve most of the content by cutting at a word boundary
      return truncated.slice(0, lastSpaceIndex) + "...";
    } else {
      // Otherwise, cut at the limit and add ellipsis
      return truncated + "...";
    }
  } catch (error) {
    console.warn("Content truncation error:", error);
    return content.slice(0, maxLength) + "...";
  }
}

/**
 * Finds the best matching segments in a text for a given query.
 * Returns the most relevant portions with context.
 */
export function extractBestMatches(
  query: string,
  content: string,
  options: {
    maxSegments?: number;
    segmentLength?: number;
    contextPadding?: number;
  } = {}
): Array<{
  segment: string;
  score: number;
  startIndex: number;
}> {
  const { maxSegments = 3, segmentLength = 100, contextPadding = 20 } = options;

  // Input validation
  if (typeof query !== "string" || typeof content !== "string") {
    return [];
  }

  try {
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const segments: Array<{ segment: string; score: number; startIndex: number }> = [];

    // Sliding window approach to find best segments
    for (let i = 0; i < content.length - segmentLength; i += segmentLength / 2) {
      const segment = content.slice(i, i + segmentLength);
      const similarity = calculateKeywordSimilarity(query, segment);

      if (similarity.relevanceScore > 0) {
        segments.push({
          segment: content.slice(
            Math.max(0, i - contextPadding),
            Math.min(content.length, i + segmentLength + contextPadding)
          ),
          score: similarity.relevanceScore,
          startIndex: i,
        });
      }
    }

    // Sort by score and return top segments
    return segments.sort((a, b) => b.score - a.score).slice(0, maxSegments);
  } catch (error) {
    console.warn("Best match extraction error:", error);
    return [];
  }
}

/**
 * Combines multiple similarity scores using weighted averaging.
 */
export function combineSimilarityScores(scores: Array<{ score: number; weight: number }>): number {
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
  } catch (error) {
    console.warn("Score combination error:", error);
    return 0;
  }
}
