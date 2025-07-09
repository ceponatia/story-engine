import { appearanceToText, personalityToText, scentsToText } from "@/lib/parsers/unified-parser";
export function processTemplate(template, context) {
    var _a;
    let prompt = template;
    prompt = prompt.replace(/\{\{character\.name\}\}/g, context.character.name || "Unknown");
    prompt = prompt.replace(/\{\{character\.age\}\}/g, ((_a = context.character.age) === null || _a === void 0 ? void 0 : _a.toString()) || "Unknown");
    prompt = prompt.replace(/\{\{character\.gender\}\}/g, context.character.gender || "Unknown");
    prompt = prompt.replace(/\{\{character\.description\}\}/g, context.character.description || "");
    const personality = typeof context.character.personality === "object"
        ? JSON.stringify(context.character.personality)
        : context.character.personality || "No personality description available";
    prompt = prompt.replace(/\{\{character\.personality\}\}/g, personality);
    const background = context.character.background || "No background information available";
    prompt = prompt.replace(/\{\{character\.background\}\}/g, background);
    const physicalAttributes = typeof context.character.appearance === "object"
        ? appearanceToText(context.character.appearance)
        : context.character.appearance || "No physical description available";
    prompt = prompt.replace(/\{\{character\.appearance\}\}/g, physicalAttributes);
    if (context.character.personality) {
        const personalityText = typeof context.character.personality === "object"
            ? personalityToText(context.character.personality)
            : context.character.personality;
        prompt = prompt.replace(/\{\{character\.personality\}\}/g, personalityText);
    }
    if (context.character.scents_aromas) {
        const scentsText = typeof context.character.scents_aromas === "object"
            ? scentsToText(context.character.scents_aromas)
            : context.character.scents_aromas;
        prompt = prompt.replace(/\{\{character\.scents_aromas\}\}/g, scentsText);
    }
    const scentsAromas = typeof context.character.scents_aromas === "object"
        ? JSON.stringify(context.character.scents_aromas)
        : context.character.scents_aromas || "No distinctive scents or traits";
    prompt = prompt.replace(/\{\{character\.scents_aromas\}\}/g, scentsAromas);
    prompt = prompt.replace(/\{\{userName\}\}/g, context.userName);
    prompt = prompt.replace(/\{\{adventureTitle\}\}/g, context.adventureTitle);
    if (context.setting) {
        prompt = prompt.replace(/\{\{#if setting\}\}/g, "");
        prompt = prompt.replace(/\{\{\/if\}\}/g, "");
        prompt = prompt.replace(/\{\{setting\.name\}\}/g, context.setting.name || "Unknown World");
        prompt = prompt.replace(/\{\{setting\.description\}\}/g, context.setting.description || "No description");
        prompt = prompt.replace(/\{\{setting\.world_type\}\}/g, context.setting.world_type || "Unknown type");
    }
    else {
        prompt = prompt.replace(/\{\{#if setting\}\}[\s\S]*?\{\{\/if\}\}/g, "");
    }
    if (context.location) {
        prompt = prompt.replace(/\{\{#if location\}\}/g, "");
        prompt = prompt.replace(/\{\{\/if\}\}/g, "");
        prompt = prompt.replace(/\{\{location\.name\}\}/g, context.location.name || "Unknown Location");
        prompt = prompt.replace(/\{\{location\.description\}\}/g, context.location.description || "No description");
    }
    else {
        prompt = prompt.replace(/\{\{#if location\}\}[\s\S]*?\{\{\/if\}\}/g, "");
    }
    prompt = prompt.replace(/\{\{[^}]*\}\}/g, "[Data not available]");
    prompt = prompt.replace(/\n\s*\n\s*\n/g, "\n\n").trim();
    return prompt;
}
