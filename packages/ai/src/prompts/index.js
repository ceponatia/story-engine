import * as originalTemplates from "./templates";
import { templateRegistry } from "./registry";
import { processTemplate } from "./utils/replacement";
export const SYSTEM_PROMPT_TEMPLATES = originalTemplates.SYSTEM_PROMPT_TEMPLATES;
export const ADVENTURE_TYPES = originalTemplates.ADVENTURE_TYPES;
export async function buildSystemPrompt(context, userId) {
    try {
        await templateRegistry.initialize();
        const template = await templateRegistry.getTemplateWithContext(context.adventureType || "general", userId);
        if (template && template.content) {
            return processTemplate(template.content, context);
        }
        return originalTemplates.buildSystemPrompt(context);
    }
    catch (error) {
        console.warn("Failed to build system prompt with MongoDB, falling back to legacy:", error);
        return originalTemplates.buildSystemPrompt(context);
    }
}
