export interface ContextWindowConfig {
    default: number;
    min: number;
    max: number;
}
export interface ResponseValidationConfig {
    maxParagraphs: number;
    enforceAsteriskFormatting: boolean;
    preventUserSpeaking: boolean;
    addEndingMarker: boolean;
    maxTokens: number;
    stopSequences: string[];
    actionPatterns: string[];
    userPatterns: RegExp[];
    contextWindow: ContextWindowConfig;
}
export declare const RESPONSE_VALIDATION_CONFIGS: Record<string, ResponseValidationConfig>;
export declare function getValidationConfig(adventureType: string): ResponseValidationConfig;
export declare function getValidationConfigWithUser(adventureType: string, userId?: string): Promise<ResponseValidationConfig>;
export declare function getStopSequences(adventureType: string, characterName?: string): string[];
export declare function getContextWindowSize(adventureType: string, customSize?: number): number;
//# sourceMappingURL=response.validation.d.ts.map