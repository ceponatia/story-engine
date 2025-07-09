import type { Template, TemplateMetadata } from "./types";
declare class TemplateRegistry {
    private templates;
    private initialized;
    registerTemplate(template: Template): void;
    getTemplate(type: string): Template | undefined;
    getTemplateWithContext(type: string, userId?: string): Promise<Template | undefined>;
    getAvailableTypes(): Array<{
        value: string;
        label: string;
    }>;
    getAllTemplates(): Template[];
    hasTemplate(type: string): boolean;
    getTemplateMetadata(type: string): TemplateMetadata | undefined;
    initialize(): Promise<void>;
    private discoverTemplatesFromModules;
    private scanTemplateFiles;
    private isValidTemplateObject;
    private loadLegacyTemplates;
    private getMongoTemplate;
    private createTemplateFromMongo;
    private getUserTemplate;
    private getPublicTemplate;
    private createTemplateFromDB;
    reset(): void;
}
export declare const templateRegistry: TemplateRegistry;
export declare function getTemplateRegistry(): TemplateRegistry;
export declare function initializeTemplateRegistry(): Promise<void>;
export {};
//# sourceMappingURL=registry.d.ts.map