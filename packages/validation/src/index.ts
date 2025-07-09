/**
 * Character Field Validation Module
 *
 * Complete validation system for protecting character attributes from
 * unauthorized or inconsistent changes via LLM responses.
 */

// MongoDB schema exports
export * from "./mongodb/character.schema";
export * from "./mongodb/location.schema";
export * from "./mongodb/setting.schema";

// Shared utilities
export * from "./shared/validateUpdateKeys";

// Note: Core validation services temporarily removed - need to be implemented
