import { PromptContext } from "./templates";
export declare const OPTIMIZED_SYSTEM_PROMPT_TEMPLATES: {
    romance: string;
    action: string;
};
export declare function buildOptimizedSystemPrompt(adventureType: keyof typeof OPTIMIZED_SYSTEM_PROMPT_TEMPLATES, context: PromptContext): string;
export declare const TEMPLATE_METRICS: {
    original: {
        romance: number;
        action: number;
    };
    optimized: {
        romance: number;
        action: number;
    };
};
//# sourceMappingURL=optimizedTemplates.d.ts.map