// Main AI package exports
export * from "./ollama/client";
export * from "./embedding.service";
export * from "./character.search";
export * from "./ragContextEnhancer";
export * from "./backgroundWorker";
export * from "./promptEnhancement";

// AI Functions
export * from "./functions";
export * from "./functions/characterTracker";
export * from "./functions/stateExtractor";
export * from "./functions/contextAnalyzer";

// Prompts
export * from "./prompts";
export * from "./prompts/registry";
export * from "./prompts/templates";
export * from "./prompts/optimizedTemplates";

// Configuration
export * from "./config/ollama";
export * from "./config/embeddings";

// Types
export * from "./types/ollama";
