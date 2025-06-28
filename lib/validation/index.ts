/**
 * Character Field Validation Module
 * 
 * Complete validation system for protecting character attributes from
 * unauthorized or inconsistent changes via LLM responses.
 */

// Core validation services
export { CharacterFieldValidator } from './character-field-validator';
export { LLMResponseValidator } from './llm-response-validator';
export { ValidatedLLMService } from './validated-llm-service';

// Types and interfaces
export type {
  ValidationContext,
  EstablishedTrait,
  CharacterFieldChange,
  AdventureMessage,
  ConfidenceFactors,
  ValidationResult,
  FieldUpdateRequest
} from './character-field-validator';

export type {
  LLMResponseValidationResult,
  BlockedUpdate,
  ValidationOptions
} from './llm-response-validator';

export type {
  ValidatedLLMRequest,
  ValidatedLLMResponse
} from './validated-llm-service';

// Confidence scoring utility
export { ConfidenceScorer } from './character-field-validator';