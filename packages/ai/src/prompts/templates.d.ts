export interface PromptContext {
    character: {
        name: string;
        age?: number;
        gender?: string;
        personality?: Record<string, unknown> | string;
        background?: string;
        appearance?: Record<string, unknown> | string;
        scents_aromas?: Record<string, unknown> | string;
        description?: string;
    };
    setting?: {
        name?: string;
        description?: string;
        world_type?: string;
        atmosphere?: string;
    };
    location?: {
        name?: string;
        description?: string;
        location_type?: string;
        climate?: string;
        atmosphere?: string;
    };
    userName: string;
    adventureTitle: string;
}
export declare const SYSTEM_PROMPT_TEMPLATES: {
    romance: string;
    action: string;
};
export declare function buildSystemPrompt(adventureType: keyof typeof SYSTEM_PROMPT_TEMPLATES, context: PromptContext): string;
export declare const ADVENTURE_TYPES: readonly [{
    readonly value: "romance";
    readonly label: "Romance";
}, {
    readonly value: "action";
    readonly label: "Action";
}];
export type AdventureType = (typeof ADVENTURE_TYPES)[number]["value"];
//# sourceMappingURL=templates.d.ts.map