/**
 * Repository Barrel Export
 *
 * Central export point for all repository modules.
 * Provides clean imports and maintains backward compatibility.
 */

// import type { CharacterFormData } from "../types"; // TODO: implement
import type { PoolClient } from "pg";

// Character Repository - TODO: implement
// export * from "./character.repository";

// Adventure Repository
export * from "./adventure.repository";
export { adventureRepository } from "./adventure.repository";

// Adventure Character Repository
export * from "./adventureCharacter.repository";
export { adventureCharacterRepository } from "./adventureCharacter.repository";

// Adventure Message Repository - TODO: implement
// export * from "./adventure-message.repository";
// export { adventureMessageRepository } from "./adventure-message.repository";

// Setting Repository - TODO: implement
// export * from "./setting.repository";
// export { settingRepository } from "./setting.repository";

// Location Repository - REMOVED: Domain entities should use MongoDB
// export * from "./location.repository";
// export { locationRepository } from "./location.repository";

// User Repository
export * from "./user.repository";
export { userRepository } from "./user.repository";

// Persona Repository - TODO: implement
// export * from "./persona.repository";
// export { personaRepository } from "./persona.repository";

// User Adventure Type Repository - TODO: implement
// export * from "./user-adventure-type.repository";
// export { userAdventureTypeRepository } from "./user-adventure-type.repository";

// Embedding Repository - TODO: implement
// export * from "./embedding.repository";
// export { embeddingRepository } from "./embedding.repository";

// Activity Repository - TODO: Create when needed

// Job Repository
export * from "./job.repository";
export { jobRepository } from "./job.repository";

// All repository functions are now exported directly from individual repository files
// Use import { functionName } from './repositories/filename.repository' instead
