export interface AIConfig {
    ollamaBaseUrl: string;
    ollamaModel: string;
    aiEnabled: boolean;
    timeout: number;
    useOptimizedTemplates: boolean;
}
export declare function validateAIConfig(): AIConfig;
export declare function getAIConfig(): AIConfig;
export declare function isAIAvailable(): boolean;
//# sourceMappingURL=validation.d.ts.map