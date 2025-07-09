/**
 * Character Trait Information Retrieval System
 *
 * This module provides precise, efficient access to character trait data from JSONB columns
 * in the adventure_characters table. It leverages the existing ATTRIBUTE_SCHEMA from
 * context-analyzer.ts to ensure consistency and type safety.
 *
 * Based on consensus analysis and existing codebase patterns.
 */

import getDatabase from "../../postgres/pool";
import {
  COMPREHENSIVE_ATTRIBUTE_SCHEMA,
  type AttributeKey,
  SCHEMA_VERSION,
} from "../schema/attribute.schema";

// Type-safe trait keys based on comprehensive schema
export type TraitKey = AttributeKey;

// Valid JSONB column names with strict type checking
const VALID_COLUMNS = ["appearance", "scents_aromas", "personality", "background"] as const;
export type ValidColumn = (typeof VALID_COLUMNS)[number];

// Request interface for trait information retrieval
export interface TraitInfoRequest {
  /** The adventure character ID to query */
  adventureCharacterId: string;
  /** The JSONB column to query from */
  column: ValidColumn;
  /** Optional JSONB path (e.g., "feet.scents") - if not provided, returns entire column */
  path?: string;
}

// Successful trait retrieval result
export interface TraitInfoSuccess {
  /** The requested column name */
  column: string;
  /** The JSONB path if specified */
  path?: string;
  /** The retrieved data value */
  value: unknown;
  /** Type of data returned for debugging */
  dataType: string;
  /** Source of the data retrieval */
  source: "database_query";
}

// Error information for failed retrievals
export interface TraitInfoError {
  /** The column that was queried */
  column: string;
  /** The path that was queried (if any) */
  path?: string;
  /** Human-readable error message */
  message: string;
  /** Error code for programmatic handling */
  code:
    | "INVALID_CHARACTER_ID"
    | "INVALID_COLUMN"
    | "INVALID_PATH"
    | "PATH_NOT_FOUND"
    | "CHARACTER_NOT_FOUND"
    | "DATABASE_ERROR";
  /** Additional context for debugging */
  details?: string;
}

// Complete response interface
export interface TraitInfoResponse {
  /** Whether the operation completed successfully */
  success: boolean;
  /** Successfully retrieved trait data */
  data?: TraitInfoSuccess;
  /** Error information if the operation failed */
  error?: TraitInfoError;
  /** Additional metadata about the query */
  metadata: {
    /** Character ID that was queried */
    characterId: string;
    /** Timestamp of the query */
    timestamp: string;
    /** Query execution time in milliseconds */
    executionTime?: number;
  };
}

/**
 * Validates that a column name is in the allowed list
 * This prevents SQL injection and ensures only valid JSONB columns are queried
 */
function validateColumn(column: string): column is ValidColumn {
  return VALID_COLUMNS.includes(column as ValidColumn);
}

/**
 * Validates and sanitizes a JSONB path string
 * Ensures the path contains only safe characters and follows expected format
 */
function validateAndSanitizePath(path: string): {
  isValid: boolean;
  sanitizedPath?: string;
  error?: string;
} {
  // Check for empty or whitespace-only paths
  if (!path || path.trim().length === 0) {
    return { isValid: false, error: "Path cannot be empty" };
  }

  // Remove leading/trailing whitespace
  const trimmedPath = path.trim();

  // Check for dangerous characters that could indicate injection attempts
  if (/[;'"\\]/.test(trimmedPath)) {
    return { isValid: false, error: "Path contains dangerous characters" };
  }

  // Validate path format: alphanumeric characters, dots, and underscores only
  if (!/^[a-zA-Z0-9_.]+$/.test(trimmedPath)) {
    return {
      isValid: false,
      error:
        "Path contains invalid characters. Only letters, numbers, dots, and underscores are allowed",
    };
  }

  // Check for reasonable length (prevent extremely long paths)
  if (trimmedPath.length > 100) {
    return { isValid: false, error: "Path is too long (maximum 100 characters)" };
  }

  // Split path into components and validate each part
  const pathParts = trimmedPath.split(".");
  for (const part of pathParts) {
    if (part.length === 0) {
      return { isValid: false, error: "Path contains empty segments" };
    }
    if (part.startsWith("_") || part.endsWith("_")) {
      return { isValid: false, error: "Path segments cannot start or end with underscores" };
    }
  }

  return { isValid: true, sanitizedPath: trimmedPath };
}

/**
 * Converts a dot-notation path to PostgreSQL JSONB array format
 * Example: "feet.scents" -> ["feet", "scents"]
 */
function pathToJsonbArray(path: string): string[] {
  return path.split(".");
}

/**
 * Main function to retrieve specific trait information from character data
 *
 * This function provides precise access to JSONB data in the adventure_characters table,
 * supporting both full column retrieval and specific path-based queries.
 *
 * @param request - The trait information request specifying character, column, and optional path
 * @returns Promise resolving to structured response with data or error information
 */
export async function get_trait_info(request: TraitInfoRequest): Promise<TraitInfoResponse> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // Initialize response structure
  const response: TraitInfoResponse = {
    success: false,
    metadata: {
      characterId: request.adventureCharacterId,
      timestamp,
    },
  };

  try {
    // === INPUT VALIDATION ===

    // Validate character ID format (should be UUID)
    if (!request.adventureCharacterId || typeof request.adventureCharacterId !== "string") {
      response.error = {
        column: request.column,
        path: request.path,
        message: "Character ID is required and must be a valid string",
        code: "INVALID_CHARACTER_ID",
        details: "Adventure character ID must be provided as a non-empty string",
      };
      return response;
    }

    // Validate column name against whitelist
    if (!validateColumn(request.column)) {
      response.error = {
        column: request.column,
        path: request.path,
        message: `Invalid column name. Must be one of: ${VALID_COLUMNS.join(", ")}`,
        code: "INVALID_COLUMN",
        details: `Received: ${request.column}, Expected one of: ${VALID_COLUMNS.join(", ")}`,
      };
      return response;
    }

    // Validate path if provided
    let sanitizedPath: string | undefined;
    if (request.path) {
      const pathValidation = validateAndSanitizePath(request.path);
      if (!pathValidation.isValid) {
        response.error = {
          column: request.column,
          path: request.path,
          message: `Invalid path format: ${pathValidation.error}`,
          code: "INVALID_PATH",
          details: `Path validation failed for: "${request.path}"`,
        };
        return response;
      }
      sanitizedPath = pathValidation.sanitizedPath;
    }

    // === DATABASE QUERY CONSTRUCTION ===

    const db = getDatabase();
    let query: string;
    let queryParams: (string | string[])[];

    if (sanitizedPath) {
      // Query specific JSONB path using #>> operator (returns as text)
      // or #> operator (returns as JSONB) depending on needs
      const pathArray = pathToJsonbArray(sanitizedPath);

      // Use #> operator to return JSONB data (preserves type information)
      query = `
        SELECT 
          $2::text as column_name,
          $3::text as path_queried,
          $1 #> $4 as extracted_value,
          CASE 
            WHEN $1 #> $4 IS NULL THEN 'null'
            WHEN jsonb_typeof($1 #> $4) = 'string' THEN 'string'
            WHEN jsonb_typeof($1 #> $4) = 'number' THEN 'number'  
            WHEN jsonb_typeof($1 #> $4) = 'boolean' THEN 'boolean'
            WHEN jsonb_typeof($1 #> $4) = 'array' THEN 'array'
            WHEN jsonb_typeof($1 #> $4) = 'object' THEN 'object'
            ELSE 'unknown'
          END as data_type
        FROM adventure_characters 
        WHERE id = $5
      `.trim();

      queryParams = [
        request.column,
        request.column,
        sanitizedPath,
        pathArray,
        request.adventureCharacterId,
      ];
    } else {
      // Query entire column
      query = `
        SELECT 
          $2::text as column_name,
          NULL as path_queried,
          $1 as extracted_value,
          CASE 
            WHEN $1 IS NULL THEN 'null'
            WHEN jsonb_typeof($1) = 'object' THEN 'object'
            WHEN jsonb_typeof($1) = 'array' THEN 'array'
            ELSE 'jsonb'
          END as data_type
        FROM adventure_characters 
        WHERE id = $3
      `.trim();

      queryParams = [request.column, request.column, request.adventureCharacterId];
    }

    // === DATABASE EXECUTION ===

    const result = await db.query(query, queryParams);

    // Check if character exists
    if (result.rows.length === 0) {
      response.error = {
        column: request.column,
        path: request.path,
        message: `Character not found with ID: ${request.adventureCharacterId}`,
        code: "CHARACTER_NOT_FOUND",
        details: "The specified adventure character ID does not exist in the database",
      };
      return response;
    }

    const row = result.rows[0];

    // Check if the requested path exists (for path-based queries)
    if (sanitizedPath && row.extracted_value === null) {
      response.error = {
        column: request.column,
        path: request.path,
        message: `Path "${sanitizedPath}" not found in column "${request.column}"`,
        code: "PATH_NOT_FOUND",
        details: `The specified JSONB path does not exist or contains null data`,
      };
      return response;
    }

    // === SUCCESS RESPONSE ===

    response.success = true;
    response.data = {
      column: row.column_name,
      path: row.path_queried,
      value: row.extracted_value,
      dataType: row.data_type,
      source: "database_query",
    };

    return response;
  } catch (error) {
    // === ERROR HANDLING ===

    console.error("Database error in get_trait_info:", error);

    response.error = {
      column: request.column,
      path: request.path,
      message: "A database error occurred while retrieving trait information",
      code: "DATABASE_ERROR",
      details: error instanceof Error ? error.message : "Unknown database error",
    };

    return response;
  } finally {
    // Add execution time to metadata
    response.metadata.executionTime = Date.now() - startTime;
  }
}

/**
 * Convenience function for retrieving predefined traits using ATTRIBUTE_SCHEMA
 * This function leverages the existing schema mapping to provide type-safe access
 * to commonly used character attributes.
 *
 * @param adventureCharacterId - The adventure character ID to query
 * @param traitKey - A predefined trait key from ATTRIBUTE_SCHEMA
 * @returns Promise resolving to trait information response
 */
export async function get_predefined_trait(
  adventureCharacterId: string,
  traitKey: TraitKey
): Promise<TraitInfoResponse> {
  const schema = COMPREHENSIVE_ATTRIBUTE_SCHEMA[traitKey];

  if (!schema) {
    return {
      success: false,
      error: {
        column: "unknown",
        message: `Unknown trait key: ${traitKey}`,
        code: "INVALID_PATH",
        details: `Trait key "${traitKey}" is not defined in COMPREHENSIVE_ATTRIBUTE_SCHEMA`,
      },
      metadata: {
        characterId: adventureCharacterId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  return get_trait_info({
    adventureCharacterId,
    column: schema.column as ValidColumn,
    path: schema.path,
  });
}

/**
 * Batch function for retrieving multiple traits efficiently
 * This function combines multiple trait queries into a single database operation
 * when possible for improved performance.
 *
 * @param adventureCharacterId - The adventure character ID to query
 * @param requests - Array of trait requests to execute
 * @returns Promise resolving to array of trait information responses
 */
export async function get_multiple_traits(
  adventureCharacterId: string,
  requests: Omit<TraitInfoRequest, "adventureCharacterId">[]
): Promise<TraitInfoResponse[]> {
  // For now, execute requests sequentially
  // Future optimization: group requests by column for more efficient querying
  const promises = requests.map((request) => get_trait_info({ ...request, adventureCharacterId }));

  return Promise.all(promises);
}

/**
 * Helper function to check if a character exists
 * Useful for validation before attempting trait retrieval
 *
 * @param adventureCharacterId - The adventure character ID to check
 * @returns Promise resolving to boolean indicating existence
 */
export async function character_exists(adventureCharacterId: string): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.query("SELECT 1 FROM adventure_characters WHERE id = $1 LIMIT 1", [
      adventureCharacterId,
    ]);
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking character existence:", error);
    return false;
  }
}
