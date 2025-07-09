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
export interface TemplateMetadata {
    type: string;
    label: string;
    description?: string;
    tags?: string[];
    version?: string;
}
export interface Template {
    content: string;
    metadata: TemplateMetadata;
    validation?: (context: PromptContext) => boolean;
}
export type AdventureType = "romance" | "action";
export declare const ADVENTURE_TYPES: readonly [{
    readonly value: "romance";
    readonly label: "Romance";
}, {
    readonly value: "action";
    readonly label: "Action";
}];
//# sourceMappingURL=types.d.ts.map