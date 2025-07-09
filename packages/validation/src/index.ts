/**
 * Validation Module
 *
 * Database-agnostic validation system for forms, entities, and shared utilities.
 * Database-specific validation logic has been moved to respective packages.
 */

// Form validation schemas (database-agnostic)
export * from "./forms";

// Entity validation schemas (database-agnostic)
export * from "./entities";

// Shared utilities
export * from "./shared/validateUpdateKeys";
