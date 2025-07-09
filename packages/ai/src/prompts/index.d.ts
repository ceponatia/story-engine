import type { PromptContext, AdventureType } from "./types";
export declare const SYSTEM_PROMPT_TEMPLATES: {
    romance: string;
    action: string;
};
export declare const ADVENTURE_TYPES: readonly [{
    readonly value: "romance";
    readonly label: "Romance";
}, {
    readonly value: "action";
    readonly label: "Action";
}];
export declare function buildSystemPrompt(context: PromptContext, userId?: string): Promise<string>;
export type { PromptContext, AdventureType };
//# sourceMappingURL=index.d.ts.map