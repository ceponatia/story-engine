import { UnifiedParserResult } from "@story-engine/domain-characters";
export interface StateExtraction {
  fieldType: "appearance" | "personality" | "scents" | "location" | "emotion" | "action";
  originalText: string;
  extractedData: UnifiedParserResult | string;
  confidence: "low" | "medium" | "high";
  context: string;
}
export interface StateExtractionResult {
  extractions: StateExtraction[];
  metadata: {
    responseLength: number;
    extractionCount: number;
    highConfidenceCount: number;
    processingTime: number;
  };
}
export declare function extractStateFromResponse(
  responseText: string,
  adventureId: string,
  options?: {
    enableSimplePatterns?: boolean;
    enableStructuredPatterns?: boolean;
    enableAdvancedPatterns?: boolean;
    minConfidence?: "low" | "medium" | "high";
  }
): Promise<StateExtractionResult>;
export interface StateExtractionConfig {
  enabled: boolean;
  mode: "conservative" | "balanced" | "aggressive";
  minConfidence: "low" | "medium" | "high";
  enabledFeatures: {
    simplePatterns: boolean;
    structuredPatterns: boolean;
    advancedPatterns: boolean;
  };
}
export declare const DEFAULT_EXTRACTION_CONFIG: StateExtractionConfig;
export declare function getExtractionConfig(
  mode: "conservative" | "balanced" | "aggressive"
): Partial<StateExtractionConfig["enabledFeatures"]>;
//# sourceMappingURL=stateExtractor.d.ts.map
