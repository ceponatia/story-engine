export const OPTIMIZED_SYSTEM_PROMPT_TEMPLATES = {
    romance: `You are {{character.name}}, {{character.description}}.

CHARACTER: Age {{character.age}}, {{character.gender}}
Personality: {{character.personality}}
Background: {{character.background}}
Appearance: {{character.appearance}}
Scents: {{character.scents_aromas}}

{{#if setting}}SETTING: {{setting.name}} - {{setting.description}} ({{setting.time_period}}){{/if}}
{{#if location}}LOCATION: {{location.name}} - {{location.description}}{{/if}}

ROLEPLAY RULES:
1. Respond ONLY as {{character.name}} - never write for {{userName}}
2. Keep responses to 1-2 paragraphs maximum
3. Use *asterisks* for thoughts/actions, "quotes" for dialogue
4. Wait for {{userName}}'s response before continuing
5. Focus on {{character.name}}'s emotions and romantic development

RESPONSE FORMAT:
"{{character.name}}'s dialogue here."
*{{character.name}}'s thoughts and actions here.*

Current scenario: {{adventureTitle}}`,
    action: `You are {{character.name}}, {{character.description}}.

CHARACTER: Age {{character.age}}, {{character.gender}}
Personality: {{character.personality}}
Background: {{character.background}}
Appearance: {{character.appearance}}

{{#if setting}}SETTING: {{setting.name}} - {{setting.description}} ({{setting.technology_level}}){{/if}}
{{#if location}}LOCATION: {{location.name}} - {{location.description}}{{/if}}

ROLEPLAY RULES:
1. Respond ONLY as {{character.name}} - never write for {{userName}}
2. Keep responses to 1-2 paragraphs maximum
3. Use *asterisks* for thoughts/actions, "quotes" for dialogue
4. Wait for {{userName}}'s response before continuing
5. Focus on quick decisions and physical actions

RESPONSE FORMAT:
"{{character.name}}'s dialogue here."
*{{character.name}}'s thoughts and actions here.*

Current adventure: {{adventureTitle}}`,
};
export function buildOptimizedSystemPrompt(adventureType, context) {
    var _a;
    const template = OPTIMIZED_SYSTEM_PROMPT_TEMPLATES[adventureType];
    if (!template) {
        throw new Error(`Unknown adventure type: ${adventureType}`);
    }
    let prompt = template;
    prompt = prompt.replace(/\{\{character\.name\}\}/g, context.character.name || "Unknown");
    prompt = prompt.replace(/\{\{character\.age\}\}/g, ((_a = context.character.age) === null || _a === void 0 ? void 0 : _a.toString()) || "Unknown");
    prompt = prompt.replace(/\{\{character\.gender\}\}/g, context.character.gender || "Unknown");
    prompt = prompt.replace(/\{\{character\.description\}\}/g, context.character.description || "");
    const personality = typeof context.character.personality === "object"
        ? JSON.stringify(context.character.personality)
        : context.character.personality || "Not specified";
    prompt = prompt.replace(/\{\{character\.personality\}\}/g, personality);
    const background = context.character.background || "Not specified";
    prompt = prompt.replace(/\{\{character\.background\}\}/g, background);
    const physicalAttributes = typeof context.character.appearance === "object"
        ? JSON.stringify(context.character.appearance)
        : context.character.appearance || "Not specified";
    prompt = prompt.replace(/\{\{character\.appearance\}\}/g, physicalAttributes);
    const scentsAromas = typeof context.character.scents_aromas === "object"
        ? JSON.stringify(context.character.scents_aromas)
        : context.character.scents_aromas || "Not specified";
    prompt = prompt.replace(/\{\{character\.scents_aromas\}\}/g, scentsAromas);
    prompt = prompt.replace(/\{\{userName\}\}/g, context.userName);
    prompt = prompt.replace(/\{\{adventureTitle\}\}/g, context.adventureTitle);
    if (context.setting) {
        prompt = prompt.replace(/\{\{#if setting\}\}/g, "");
        prompt = prompt.replace(/\{\{\/if\}\}/g, "");
        prompt = prompt.replace(/\{\{setting\.name\}\}/g, context.setting.name || "Unknown World");
        prompt = prompt.replace(/\{\{setting\.description\}\}/g, context.setting.description || "No description");
        prompt = prompt.replace(/\{\{setting\.time_period\}\}/g, context.setting.time_period || "Unknown time");
        prompt = prompt.replace(/\{\{setting\.technology_level\}\}/g, context.setting.technology_level || "Unknown tech level");
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
export const TEMPLATE_METRICS = {
    original: {
        romance: 60,
        action: 59,
    },
    optimized: {
        romance: 23,
        action: 21,
    },
};
