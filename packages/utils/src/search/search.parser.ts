// packages/utils/search/search.parser.ts

/**
 * Search query parsing utilities for consistent search behavior across all packages.
 * Provides normalization, sanitization, and filter parsing for search functionality.
 */

export interface SearchQuery {
  readonly query: string;
  readonly originalQuery: string;
  readonly tokens: readonly string[];
}

export interface ParsedFilters {
  readonly [key: string]: string;
}

export interface SearchOptions {
  readonly preserveSpecialChars?: readonly string[];
  readonly minTokenLength?: number;
  readonly maxQueryLength?: number;
}

/**
 * Common filter values to ignore during parsing
 */
const IGNORED_FILTER_VALUES = new Set([
  "all",
  "all ages",
  "all genres",
  "all types",
  "any",
  "none",
  "default",
]);

/**
 * Maximum query length to prevent ReDoS attacks
 */
const MAX_QUERY_LENGTH = 1000;

/**
 * Normalizes search input and applies configurable sanitization.
 * Can be extended with fuzzy matching or stemming logic later.
 */
export function parseSearchQuery(query: string, options: SearchOptions = {}): SearchQuery {
  // Input validation
  if (typeof query !== "string") {
    return { query: "", originalQuery: query || "", tokens: [] };
  }

  // Prevent ReDoS attacks
  if (query.length > MAX_QUERY_LENGTH) {
    query = query.slice(0, MAX_QUERY_LENGTH);
  }

  const originalQuery = query;
  const { preserveSpecialChars = ["+", "#", "-", "."], minTokenLength = 1 } = options;

  try {
    // Create character class for preservation
    const preservePattern =
      preserveSpecialChars.length > 0
        ? preserveSpecialChars.map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("")
        : "";

    // Less aggressive sanitization - preserve some useful characters
    const specialCharPattern = preservePattern
      ? new RegExp(`[^a-zA-Z0-9\\s${preservePattern}]`, "g")
      : /[^a-zA-Z0-9\s]/g;

    const normalized = query
      .trim()
      .toLowerCase()
      .replace(specialCharPattern, " ") // Replace unwanted special characters with space
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    const tokens = normalized.split(" ").filter((token) => token.length >= minTokenLength);

    return {
      query: normalized,
      originalQuery,
      tokens,
    };
  } catch (error) {
    // Fallback to basic sanitization if regex fails
    console.warn("Search query parsing error, using fallback:", error);
    const fallback = query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      query: fallback,
      originalQuery,
      tokens: fallback.split(" ").filter((token) => token.length >= minTokenLength),
    };
  }
}

/**
 * Parses and normalizes filter values for database queries.
 * Filters out common "all" values and normalizes filter values.
 */
export function parseFilters(filters: Record<string, string>): ParsedFilters {
  // Input validation
  if (!filters || typeof filters !== "object") {
    return {};
  }

  const parsed: Record<string, string> = {};

  try {
    for (const key in filters) {
      // Validate key
      if (typeof key !== "string" || typeof filters[key] !== "string") {
        continue;
      }

      const value = filters[key].toLowerCase().replace(/-/g, " ").trim();

      // Skip ignored filter values
      if (!IGNORED_FILTER_VALUES.has(value) && value.length > 0) {
        parsed[key] = value;
      }
    }
  } catch (error) {
    console.warn("Filter parsing error:", error);
    return {};
  }

  return parsed;
}

/**
 * Validates that a search query meets minimum requirements.
 */
export function validateSearchQuery(query: string, minLength: number = 2): boolean {
  // Input validation
  if (typeof query !== "string") {
    return false;
  }

  try {
    const parsed = parseSearchQuery(query);
    return parsed.query.length >= minLength && parsed.tokens.length > 0;
  } catch (error) {
    console.warn("Search query validation error:", error);
    return false;
  }
}

/**
 * Escapes special characters for SQL LIKE clauses.
 * Only handles SQL wildcards - use specific escape functions for other databases.
 */
export function escapeForSqlLike(query: string): string {
  // Input validation
  if (typeof query !== "string") {
    return "";
  }

  try {
    return query.replace(/[%_\\]/g, "\\$&");
  } catch (error) {
    console.warn("SQL escape error:", error);
    return "";
  }
}

/**
 * Escapes special characters for MongoDB regex patterns.
 */
export function escapeForMongoRegex(query: string): string {
  // Input validation
  if (typeof query !== "string") {
    return "";
  }

  try {
    return query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  } catch (error) {
    console.warn("MongoDB regex escape error:", error);
    return "";
  }
}

/**
 * General database escape function - delegates to specific implementations.
 * @deprecated Use specific escape functions like escapeForSqlLike or escapeForMongoRegex
 */
export function escapeSearchQuery(query: string): string {
  console.warn(
    "escapeSearchQuery is deprecated. Use escapeForSqlLike or escapeForMongoRegex instead."
  );
  return escapeForSqlLike(query);
}
