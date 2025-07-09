/**
 * Optimized Prompt Templates for Phase 3
 *
 * These templates are streamlined versions of the original templates,
 * optimized for Mistral model performance with 60%+ reduction in verbosity
 * while maintaining all critical functionality.
 */

import { PromptContext } from "./templates";

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

/**
 * Builds an optimized system prompt using streamlined templates
 * This is the Phase 3 optimized version of buildSystemPrompt()
 */
export function buildOptimizedSystemPrompt(
  adventureType: keyof typeof OPTIMIZED_SYSTEM_PROMPT_TEMPLATES,
  context: PromptContext
): string {
  const template = OPTIMIZED_SYSTEM_PROMPT_TEMPLATES[adventureType];

  if (!template) {
    throw new Error(`Unknown adventure type: ${adventureType}`);
  }

  // Use the same template replacement logic as the original
  // but with the optimized templates
  let prompt = template;

  // Replace character fields
  prompt = prompt.replace(/\{\{character\.name\}\}/g, context.character.name || "Unknown");
  prompt = prompt.replace(
    /\{\{character\.age\}\}/g,
    context.character.age?.toString() || "Unknown"
  );
  prompt = prompt.replace(/\{\{character\.gender\}\}/g, context.character.gender || "Unknown");
  prompt = prompt.replace(/\{\{character\.description\}\}/g, context.character.description || "");

  // Handle JSONB fields with fallback
  const personality =
    typeof context.character.personality === "object"
      ? JSON.stringify(context.character.personality)
      : context.character.personality || "Not specified";
  prompt = prompt.replace(/\{\{character\.personality\}\}/g, personality);

  const background = context.character.background || "Not specified";
  prompt = prompt.replace(/\{\{character\.background\}\}/g, background);

  const physicalAttributes =
    typeof context.character.appearance === "object"
      ? JSON.stringify(context.character.appearance)
      : context.character.appearance || "Not specified";
  prompt = prompt.replace(/\{\{character\.appearance\}\}/g, physicalAttributes);

  const scentsAromas =
    typeof context.character.scents_aromas === "object"
      ? JSON.stringify(context.character.scents_aromas)
      : context.character.scents_aromas || "Not specified";
  prompt = prompt.replace(/\{\{character\.scents_aromas\}\}/g, scentsAromas);

  // Replace user and adventure fields
  prompt = prompt.replace(/\{\{userName\}\}/g, context.userName);
  prompt = prompt.replace(/\{\{adventureTitle\}\}/g, context.adventureTitle);

  // Handle conditional setting block
  if (context.setting) {
    prompt = prompt.replace(/\{\{#if setting\}\}/g, "");
    prompt = prompt.replace(/\{\{\/if\}\}/g, "");
    prompt = prompt.replace(/\{\{setting\.name\}\}/g, context.setting.name || "Unknown World");
    prompt = prompt.replace(
      /\{\{setting\.description\}\}/g,
      context.setting.description || "No description"
    );
    prompt = prompt.replace(
      /\{\{setting\.time_period\}\}/g,
      context.setting.time_period || "Unknown time"
    );
    prompt = prompt.replace(
      /\{\{setting\.technology_level\}\}/g,
      context.setting.technology_level || "Unknown tech level"
    );
  } else {
    prompt = prompt.replace(/\{\{#if setting\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  }

  // Handle conditional location block
  if (context.location) {
    prompt = prompt.replace(/\{\{#if location\}\}/g, "");
    prompt = prompt.replace(/\{\{\/if\}\}/g, "");
    prompt = prompt.replace(/\{\{location\.name\}\}/g, context.location.name || "Unknown Location");
    prompt = prompt.replace(
      /\{\{location\.description\}\}/g,
      context.location.description || "No description"
    );
  } else {
    prompt = prompt.replace(/\{\{#if location\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  }

  // Clean up any remaining template syntax
  prompt = prompt.replace(/\{\{[^}]*\}\}/g, "[Data not available]");

  // Clean up extra whitespace
  prompt = prompt.replace(/\n\s*\n\s*\n/g, "\n\n").trim();

  return prompt;
}

// Template metrics for comparison
export const TEMPLATE_METRICS = {
  original: {
    romance: 60, // approximate line count
    action: 59,
  },
  optimized: {
    romance: 23, // 62% reduction
    action: 21, // 64% reduction
  },
};
