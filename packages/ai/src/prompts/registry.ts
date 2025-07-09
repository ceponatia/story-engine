// Template discovery and registration system with MongoDB integration

import * as fs from "fs";
import * as path from "path";
import type { Template, TemplateMetadata } from "./types";
import { validateTemplate } from "./utils/validation";
import { MongoManager } from "../postgres/mongodb";

class TemplateRegistry {
  private templates = new Map<string, Template>();
  private initialized = false;

  /**
   * Register a template with the registry
   */
  registerTemplate(template: Template): void {
    validateTemplate(template);
    this.templates.set(template.metadata.type, template);
  }

  /**
   * Get a template by type
   */
  getTemplate(type: string): Template | undefined {
    return this.templates.get(type);
  }

  /**
   * Get a template by type with user context (hybrid MongoDB + filesystem support)
   * Priority: MongoDB user-specific -> MongoDB public -> Filesystem -> Legacy DB
   */
  async getTemplateWithContext(type: string, userId?: string): Promise<Template | undefined> {
    try {
      // 1. Check MongoDB for user-specific templates first
      if (userId) {
        const mongoUserTemplate = await this.getMongoTemplate(type, userId);
        if (mongoUserTemplate) return mongoUserTemplate;
      }

      // 2. Check MongoDB for public/system templates
      const mongoTemplate = await this.getMongoTemplate(type);
      if (mongoTemplate) return mongoTemplate;

      // 3. Fall back to filesystem templates (auto-discovered)
      const filesystemTemplate = this.templates.get(type);
      if (filesystemTemplate) return filesystemTemplate;

      // 4. Legacy fallback - PostgreSQL user templates
      if (userId) {
        const userTemplate = await this.getUserTemplate(type, userId);
        if (userTemplate) return userTemplate;
      }

      // 5. Legacy fallback - PostgreSQL public templates
      const publicTemplate = await this.getPublicTemplate(type);
      if (publicTemplate) return publicTemplate;
    } catch (error) {
      console.warn(`Error fetching template ${type}:`, error);
    }

    return undefined;
  }

  /**
   * Get all available template types
   */
  getAvailableTypes(): Array<{ value: string; label: string }> {
    return Array.from(this.templates.values()).map((template) => ({
      value: template.metadata.type,
      label: template.metadata.label,
    }));
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): Template[] {
    return Array.from(this.templates.values());
  }

  /**
   * Check if a template type is registered
   */
  hasTemplate(type: string): boolean {
    return this.templates.has(type);
  }

  /**
   * Get template metadata by type
   */
  getTemplateMetadata(type: string): TemplateMetadata | undefined {
    return this.templates.get(type)?.metadata;
  }

  /**
   * Initialize registry with available templates
   * Auto-discovers templates from the templates/ directory
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Try to import optimized templates first
      await this.discoverTemplatesFromModules();

      // Fallback to legacy templates if modules not available
      if (this.templates.size === 0) {
        await this.loadLegacyTemplates();
      }

      this.initialized = true;
    } catch (error) {
      console.warn("Failed to initialize template registry:", error);
      // Graceful fallback - registry will be empty but functional
      this.initialized = true;
    }
  }

  /**
   * Discover templates from modular template files
   */
  private async discoverTemplatesFromModules(): Promise<void> {
    try {
      // First try the organized template modules
      const { OPTIMIZED_TEMPLATES } = await import("./templates/index");

      for (const [, template] of Object.entries(OPTIMIZED_TEMPLATES)) {
        this.registerTemplate(template);
      }

      // If successful, also scan for additional templates in the filesystem
      await this.scanTemplateFiles();
    } catch (error) {
      console.warn("Failed to load optimized templates:", error);
    }
  }

  /**
   * Scan the templates directory for additional template files
   */
  private async scanTemplateFiles(): Promise<void> {
    try {
      const templatesDir = path.join(__dirname, "templates");

      if (!fs.existsSync(templatesDir)) {
        return;
      }

      const files = fs.readdirSync(templatesDir);

      for (const file of files) {
        if (file.endsWith(".ts") && file !== "index.ts") {
          const templateName = path.basename(file, ".ts");

          // Skip if already registered
          if (this.hasTemplate(templateName)) {
            continue;
          }

          try {
            // Use static imports for known templates to avoid dynamic import warnings
            let templateModule: any = null;
            if (templateName === "romance") {
              templateModule = await import("./templates/romance");
            } else if (templateName === "action") {
              templateModule = await import("./templates/action");
            }

            if (templateModule) {
              // Look for exported template objects
              for (const exportName in templateModule) {
                const exportedValue = templateModule[exportName];

                if (this.isValidTemplateObject(exportedValue)) {
                  this.registerTemplate(exportedValue);
                }
              }
            }
          } catch (importError) {
            console.warn(`Failed to import template from ${file}:`, importError);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to scan template files:", error);
    }
  }

  /**
   * Check if an object is a valid template
   */
  private isValidTemplateObject(obj: unknown): obj is Template {
    return (
      obj &&
      typeof obj === "object" &&
      typeof obj.content === "string" &&
      obj.metadata &&
      typeof obj.metadata.type === "string" &&
      typeof obj.metadata.label === "string"
    );
  }

  /**
   * Load legacy templates for backward compatibility
   */
  private async loadLegacyTemplates(): Promise<void> {
    try {
      // Import existing templates to maintain compatibility
      const originalTemplates = await import("./templates");
      const { SYSTEM_PROMPT_TEMPLATES } = originalTemplates;

      // Register romance template
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

      // Register action template
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
    } catch (error) {
      console.warn("Failed to load legacy templates:", error);
    }
  }

  /**
   * Get template from MongoDB
   * Priority: user-specific template -> public template -> system template
   */
  private async getMongoTemplate(type: string, userId?: string): Promise<Template | undefined> {
    try {
      const mongoDoc = await MongoManager.getTemplate(type, userId);
      if (mongoDoc) {
        return this.createTemplateFromMongo(mongoDoc);
      }
    } catch (error) {
      console.warn(`Failed to load MongoDB template ${type}:`, error);
    }

    return undefined;
  }

  /**
   * Create Template object from MongoDB document
   */
  private createTemplateFromMongo(mongoDoc: any): Template {
    return {
      content: mongoDoc.content,
      metadata: {
        type: mongoDoc.type,
        label: mongoDoc.metadata.label,
        description:
          mongoDoc.metadata.description || `${mongoDoc.metadata.label} adventure template`,
        tags: mongoDoc.metadata.tags || [],
        version: mongoDoc.metadata.version || "1.0.0",
      },
      validation: () => true, // MongoDB templates are pre-validated
    };
  }

  /**
   * Get user-specific template from PostgreSQL database (legacy)
   */
  private async getUserTemplate(type: string, userId: string): Promise<Template | undefined> {
    try {
      // Dynamic import to avoid circular dependencies
      const { getUserAdventureTypeByName } = await import("@/lib/postgres/repositories");

      const dbTemplate = await getUserAdventureTypeByName(type, userId);
      if (dbTemplate) {
        return this.createTemplateFromDB(dbTemplate);
      }
    } catch (error) {
      console.warn(`Failed to load user template ${type} for user ${userId}:`, error);
    }

    return undefined;
  }

  /**
   * Get public template from database
   */
  private async getPublicTemplate(type: string): Promise<Template | undefined> {
    try {
      // Dynamic import to avoid circular dependencies
      const { getPublicAdventureTypeByName } = await import("@/lib/postgres/repositories");

      const dbTemplate = await getPublicAdventureTypeByName(type);
      if (dbTemplate) {
        return this.createTemplateFromDB(dbTemplate);
      }
    } catch (error) {
      console.warn(`Failed to load public template ${type}:`, error);
    }

    return undefined;
  }

  /**
   * Create Template object from database record
   */
  private createTemplateFromDB(dbTemplate: any): Template {
    return {
      content: dbTemplate.template_content,
      metadata: {
        type: dbTemplate.name,
        label: dbTemplate.name.charAt(0).toUpperCase() + dbTemplate.name.slice(1),
        description: dbTemplate.description || `User-created ${dbTemplate.name} adventure type`,
        tags: ["user-created"],
        version: "1.0.0",
      },
      validation: () => true, // User templates are pre-validated
    };
  }

  /**
   * Reset the registry (useful for testing)
   */
  reset(): void {
    this.templates.clear();
    this.initialized = false;
  }
}

// Singleton instance
export const templateRegistry = new TemplateRegistry();

/**
 * Get the template registry instance
 */
export function getTemplateRegistry(): TemplateRegistry {
  return templateRegistry;
}

/**
 * Initialize the template registry
 */
export async function initializeTemplateRegistry(): Promise<void> {
  await templateRegistry.initialize();
}
