import * as fs from "fs";
import * as path from "path";
import { validateTemplate } from "./utils/validation";
import { MongoManager } from "../postgres/mongodb";
class TemplateRegistry {
    constructor() {
        this.templates = new Map();
        this.initialized = false;
    }
    registerTemplate(template) {
        validateTemplate(template);
        this.templates.set(template.metadata.type, template);
    }
    getTemplate(type) {
        return this.templates.get(type);
    }
    async getTemplateWithContext(type, userId) {
        try {
            if (userId) {
                const mongoUserTemplate = await this.getMongoTemplate(type, userId);
                if (mongoUserTemplate)
                    return mongoUserTemplate;
            }
            const mongoTemplate = await this.getMongoTemplate(type);
            if (mongoTemplate)
                return mongoTemplate;
            const filesystemTemplate = this.templates.get(type);
            if (filesystemTemplate)
                return filesystemTemplate;
            if (userId) {
                const userTemplate = await this.getUserTemplate(type, userId);
                if (userTemplate)
                    return userTemplate;
            }
            const publicTemplate = await this.getPublicTemplate(type);
            if (publicTemplate)
                return publicTemplate;
        }
        catch (error) {
            console.warn(`Error fetching template ${type}:`, error);
        }
        return undefined;
    }
    getAvailableTypes() {
        return Array.from(this.templates.values()).map((template) => ({
            value: template.metadata.type,
            label: template.metadata.label,
        }));
    }
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    hasTemplate(type) {
        return this.templates.has(type);
    }
    getTemplateMetadata(type) {
        var _a;
        return (_a = this.templates.get(type)) === null || _a === void 0 ? void 0 : _a.metadata;
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            await this.discoverTemplatesFromModules();
            if (this.templates.size === 0) {
                await this.loadLegacyTemplates();
            }
            this.initialized = true;
        }
        catch (error) {
            console.warn("Failed to initialize template registry:", error);
            this.initialized = true;
        }
    }
    async discoverTemplatesFromModules() {
        try {
            const { OPTIMIZED_TEMPLATES } = await import("./templates/index");
            for (const [, template] of Object.entries(OPTIMIZED_TEMPLATES)) {
                this.registerTemplate(template);
            }
            await this.scanTemplateFiles();
        }
        catch (error) {
            console.warn("Failed to load optimized templates:", error);
        }
    }
    async scanTemplateFiles() {
        try {
            const templatesDir = path.join(__dirname, "templates");
            if (!fs.existsSync(templatesDir)) {
                return;
            }
            const files = fs.readdirSync(templatesDir);
            for (const file of files) {
                if (file.endsWith(".ts") && file !== "index.ts") {
                    const templateName = path.basename(file, ".ts");
                    if (this.hasTemplate(templateName)) {
                        continue;
                    }
                    try {
                        let templateModule = null;
                        if (templateName === "romance") {
                            templateModule = await import("./templates/romance");
                        }
                        else if (templateName === "action") {
                            templateModule = await import("./templates/action");
                        }
                        if (templateModule) {
                            for (const exportName in templateModule) {
                                const exportedValue = templateModule[exportName];
                                if (this.isValidTemplateObject(exportedValue)) {
                                    this.registerTemplate(exportedValue);
                                }
                            }
                        }
                    }
                    catch (importError) {
                        console.warn(`Failed to import template from ${file}:`, importError);
                    }
                }
            }
        }
        catch (error) {
            console.warn("Failed to scan template files:", error);
        }
    }
    isValidTemplateObject(obj) {
        return (obj &&
            typeof obj === "object" &&
            typeof obj.content === "string" &&
            obj.metadata &&
            typeof obj.metadata.type === "string" &&
            typeof obj.metadata.label === "string");
    }
    async loadLegacyTemplates() {
        try {
            const originalTemplates = await import("./templates");
            const { SYSTEM_PROMPT_TEMPLATES } = originalTemplates;
            if (SYSTEM_PROMPT_TEMPLATES.romance) {
                this.registerTemplate({
                    content: SYSTEM_PROMPT_TEMPLATES.romance,
                    metadata: {
                        type: "romance",
                        label: "Romance",
                        description: "Romantic adventure template focusing on emotional connections",
                        tags: ["romance", "emotional", "relationship"],
                        version: "1.0.0",
                    },
                });
            }
            if (SYSTEM_PROMPT_TEMPLATES.action) {
                this.registerTemplate({
                    content: SYSTEM_PROMPT_TEMPLATES.action,
                    metadata: {
                        type: "action",
                        label: "Action",
                        description: "Action-packed adventure template focusing on excitement and challenges",
                        tags: ["action", "adventure", "excitement"],
                        version: "1.0.0",
                    },
                });
            }
        }
        catch (error) {
            console.warn("Failed to load legacy templates:", error);
        }
    }
    async getMongoTemplate(type, userId) {
        try {
            const mongoDoc = await MongoManager.getTemplate(type, userId);
            if (mongoDoc) {
                return this.createTemplateFromMongo(mongoDoc);
            }
        }
        catch (error) {
            console.warn(`Failed to load MongoDB template ${type}:`, error);
        }
        return undefined;
    }
    createTemplateFromMongo(mongoDoc) {
        return {
            content: mongoDoc.content,
            metadata: {
                type: mongoDoc.type,
                label: mongoDoc.metadata.label,
                description: mongoDoc.metadata.description || `${mongoDoc.metadata.label} adventure template`,
                tags: mongoDoc.metadata.tags || [],
                version: mongoDoc.metadata.version || "1.0.0",
            },
            validation: () => true,
        };
    }
    async getUserTemplate(type, userId) {
        try {
            const { getUserAdventureTypeByName } = await import("@/lib/postgres/repositories");
            const dbTemplate = await getUserAdventureTypeByName(type, userId);
            if (dbTemplate) {
                return this.createTemplateFromDB(dbTemplate);
            }
        }
        catch (error) {
            console.warn(`Failed to load user template ${type} for user ${userId}:`, error);
        }
        return undefined;
    }
    async getPublicTemplate(type) {
        try {
            const { getPublicAdventureTypeByName } = await import("@/lib/postgres/repositories");
            const dbTemplate = await getPublicAdventureTypeByName(type);
            if (dbTemplate) {
                return this.createTemplateFromDB(dbTemplate);
            }
        }
        catch (error) {
            console.warn(`Failed to load public template ${type}:`, error);
        }
        return undefined;
    }
    createTemplateFromDB(dbTemplate) {
        return {
            content: dbTemplate.template_content,
            metadata: {
                type: dbTemplate.name,
                label: dbTemplate.name.charAt(0).toUpperCase() + dbTemplate.name.slice(1),
                description: dbTemplate.description || `User-created ${dbTemplate.name} adventure type`,
                tags: ["user-created"],
                version: "1.0.0",
            },
            validation: () => true,
        };
    }
    reset() {
        this.templates.clear();
        this.initialized = false;
    }
}
export const templateRegistry = new TemplateRegistry();
export function getTemplateRegistry() {
    return templateRegistry;
}
export async function initializeTemplateRegistry() {
    await templateRegistry.initialize();
}
