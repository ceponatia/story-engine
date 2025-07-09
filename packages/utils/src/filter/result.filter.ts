// packages/utils/filter/result.filter.ts

/**
 * Result filtering and sorting utilities for search results.
 * Provides consistent filtering, sorting, and pagination across search implementations.
 */

import type { SearchResult, SearchOptions } from "@story-engine/types";

export interface FilterOptions extends SearchOptions {
  readonly typeFilter?: readonly string[];
  readonly sourceFilter?: readonly string[];
  readonly minScore?: number;
  readonly maxAge?: number;
  readonly deduplicateBy?: "content" | "source" | "metadata";
}

export interface PaginationOptions {
  readonly page?: number;
  readonly pageSize?: number;
  readonly offset?: number;
  readonly limit?: number;
}

export interface SortOptions {
  readonly sortBy?: "relevance" | "timestamp" | "type" | "source";
  readonly sortOrder?: "asc" | "desc";
  readonly secondarySort?: "relevance" | "timestamp" | "type" | "source";
}

/**
 * Filters search results based on various criteria.
 */
export function filterSearchResults(
  results: readonly SearchResult[],
  options: FilterOptions = {}
): readonly SearchResult[] {
  if (!Array.isArray(results)) {
    return [];
  }

  const { typeFilter, sourceFilter, minScore = 0, maxAge, threshold = 0 } = options;

  try {
    let filtered = [...results];

    // Filter by type
    if (typeFilter && typeFilter.length > 0) {
      filtered = filtered.filter((result) => typeFilter.includes(result.type));
    }

    // Filter by source
    if (sourceFilter && sourceFilter.length > 0) {
      filtered = filtered.filter((result) => sourceFilter.includes(result.metadata.source));
    }

    // Filter by minimum score
    const scoreThreshold = Math.max(minScore, threshold);
    if (scoreThreshold > 0) {
      filtered = filtered.filter((result) => result.relevanceScore >= scoreThreshold);
    }

    // Filter by age if specified
    if (maxAge && maxAge > 0) {
      const cutoffTime = new Date(Date.now() - maxAge * 60 * 60 * 1000);
      filtered = filtered.filter((result) => {
        if (!result.metadata.timestamp) return true;
        return new Date(result.metadata.timestamp) >= cutoffTime;
      });
    }

    return filtered;
  } catch (error) {
    console.warn("Result filtering error:", error);
    return results;
  }
}

/**
 * Sorts search results based on specified criteria.
 */
export function sortSearchResults(
  results: readonly SearchResult[],
  options: SortOptions = {}
): readonly SearchResult[] {
  if (!Array.isArray(results)) {
    return [];
  }

  const { sortBy = "relevance", sortOrder = "desc", secondarySort } = options;

  try {
    return [...results].sort((a, b) => {
      // Primary sort
      let comparison = compareResults(a, b, sortBy);

      if (sortOrder === "asc") {
        comparison = -comparison;
      }

      // Secondary sort if primary values are equal
      if (comparison === 0 && secondarySort && secondarySort !== sortBy) {
        comparison = compareResults(a, b, secondarySort);
        // Secondary sort is always descending for relevance, ascending for others
        if (secondarySort !== "relevance") {
          comparison = -comparison;
        }
      }

      return comparison;
    });
  } catch (error) {
    console.warn("Result sorting error:", error);
    return results;
  }
}

/**
 * Applies pagination to search results.
 */
export function paginateSearchResults(
  results: readonly SearchResult[],
  options: PaginationOptions = {}
): {
  readonly results: readonly SearchResult[];
  readonly pagination: {
    readonly totalResults: number;
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
} {
  if (!Array.isArray(results)) {
    return {
      results: [],
      pagination: {
        totalResults: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  const { page, pageSize, offset, limit } = options;

  try {
    // Handle offset/limit style pagination
    if (typeof offset === "number" || typeof limit === "number") {
      const startIndex = offset || 0;
      const endIndex = limit ? startIndex + limit : results.length;

      return {
        results: results.slice(startIndex, endIndex),
        pagination: {
          totalResults: results.length,
          page: Math.floor(startIndex / (limit || 10) + 1),
          pageSize: limit || 10,
          totalPages: Math.ceil(results.length / (limit || 10)),
          hasNextPage: endIndex < results.length,
          hasPreviousPage: startIndex > 0,
        },
      };
    }

    // Handle page/pageSize style pagination
    const currentPage = Math.max(1, page || 1);
    const itemsPerPage = Math.max(1, pageSize || 10);
    const totalPages = Math.ceil(results.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, results.length);

    return {
      results: results.slice(startIndex, endIndex),
      pagination: {
        totalResults: results.length,
        page: currentPage,
        pageSize: itemsPerPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  } catch (error) {
    console.warn("Result pagination error:", error);
    return {
      results: results,
      pagination: {
        totalResults: results.length,
        page: 1,
        pageSize: results.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Removes duplicate results based on specified criteria.
 */
export function deduplicateSearchResults(
  results: readonly SearchResult[],
  deduplicateBy: "content" | "source" | "metadata" = "content"
): readonly SearchResult[] {
  if (!Array.isArray(results)) {
    return [];
  }

  try {
    const seen = new Set<string>();
    const deduplicated: SearchResult[] = [];

    for (const result of results) {
      let key: string;

      switch (deduplicateBy) {
        case "content":
          key = result.content.trim().toLowerCase();
          break;
        case "source":
          key = `${result.metadata.source}:${result.type}`;
          break;
        case "metadata":
          key = result.metadata.timestamp || result.metadata.source || result.content;
          break;
        default:
          key = result.content;
      }

      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(result);
      }
    }

    return deduplicated;
  } catch (error) {
    console.warn("Result deduplication error:", error);
    return results;
  }
}

/**
 * Combines multiple result arrays and applies filtering, sorting, and pagination.
 */
export function combineAndProcessResults(
  resultArrays: readonly (readonly SearchResult[])[],
  options: FilterOptions & SortOptions & PaginationOptions & SearchOptions = {}
): {
  readonly results: readonly SearchResult[];
  readonly pagination?: {
    readonly totalResults: number;
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
  };
} {
  try {
    // Combine all results
    const combined = resultArrays.flat();

    // Apply deduplication if specified
    let processed = options.deduplicateBy
      ? deduplicateSearchResults(combined, options.deduplicateBy)
      : combined;

    // Apply filtering
    processed = filterSearchResults(processed, options);

    // Apply sorting
    processed = sortSearchResults(processed, options);

    // Apply pagination if requested
    if (options.page || options.pageSize || options.offset || options.limit) {
      const paginated = paginateSearchResults(processed, options);
      return {
        results: paginated.results,
        pagination: paginated.pagination,
      };
    }

    // Apply simple limit if no pagination
    if (options.maxResults && options.maxResults > 0) {
      processed = processed.slice(0, options.maxResults);
    }

    return { results: processed };
  } catch (error) {
    console.warn("Result combination error:", error);
    return { results: [] };
  }
}

/**
 * Helper function to compare two search results for sorting.
 */
function compareResults(
  a: SearchResult,
  b: SearchResult,
  sortBy: "relevance" | "timestamp" | "type" | "source"
): number {
  switch (sortBy) {
    case "relevance":
      return b.relevanceScore - a.relevanceScore;

    case "timestamp":
      const timeA = a.metadata.timestamp ? new Date(a.metadata.timestamp).getTime() : 0;
      const timeB = b.metadata.timestamp ? new Date(b.metadata.timestamp).getTime() : 0;
      return timeB - timeA;

    case "type":
      return a.type.localeCompare(b.type);

    case "source":
      return a.metadata.source.localeCompare(b.metadata.source);

    default:
      return 0;
  }
}
