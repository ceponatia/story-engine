import getDatabase from "../../postgres/pool";
import { COMPREHENSIVE_ATTRIBUTE_SCHEMA, } from "../schema/attribute.schema";
const VALID_COLUMNS = ["appearance", "scents_aromas", "personality", "background"];
function validateColumn(column) {
    return VALID_COLUMNS.includes(column);
}
function validateAndSanitizePath(path) {
    if (!path || path.trim().length === 0) {
        return { isValid: false, error: "Path cannot be empty" };
    }
    const trimmedPath = path.trim();
    if (/[;'"\\]/.test(trimmedPath)) {
        return { isValid: false, error: "Path contains dangerous characters" };
    }
    if (!/^[a-zA-Z0-9_.]+$/.test(trimmedPath)) {
        return {
            isValid: false,
            error: "Path contains invalid characters. Only letters, numbers, dots, and underscores are allowed",
        };
    }
    if (trimmedPath.length > 100) {
        return { isValid: false, error: "Path is too long (maximum 100 characters)" };
    }
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
function pathToJsonbArray(path) {
    return path.split(".");
}
export async function get_trait_info(request) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const response = {
        success: false,
        metadata: {
            characterId: request.adventureCharacterId,
            timestamp,
        },
    };
    try {
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
        let sanitizedPath;
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
        const db = getDatabase();
        let query;
        let queryParams;
        if (sanitizedPath) {
            const pathArray = pathToJsonbArray(sanitizedPath);
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
        }
        else {
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
        const result = await db.query(query, queryParams);
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
        response.success = true;
        response.data = {
            column: row.column_name,
            path: row.path_queried,
            value: row.extracted_value,
            dataType: row.data_type,
            source: "database_query",
        };
        return response;
    }
    catch (error) {
        console.error("Database error in get_trait_info:", error);
        response.error = {
            column: request.column,
            path: request.path,
            message: "A database error occurred while retrieving trait information",
            code: "DATABASE_ERROR",
            details: error instanceof Error ? error.message : "Unknown database error",
        };
        return response;
    }
    finally {
        response.metadata.executionTime = Date.now() - startTime;
    }
}
export async function get_predefined_trait(adventureCharacterId, traitKey) {
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
        column: schema.column,
        path: schema.path,
    });
}
export async function get_multiple_traits(adventureCharacterId, requests) {
    const promises = requests.map((request) => get_trait_info(Object.assign(Object.assign({}, request), { adventureCharacterId })));
    return Promise.all(promises);
}
export async function character_exists(adventureCharacterId) {
    try {
        const db = getDatabase();
        const result = await db.query("SELECT 1 FROM adventure_characters WHERE id = $1 LIMIT 1", [
            adventureCharacterId,
        ]);
        return result.rows.length > 0;
    }
    catch (error) {
        console.error("Error checking character existence:", error);
        return false;
    }
}
