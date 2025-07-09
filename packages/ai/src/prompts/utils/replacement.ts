// String replacement utilities for template processing

import type { PromptContext } from "../types";
import { appearanceToText, personalityToText, scentsToText } from "@/lib/parsers/unified-parser";

/**
 * Process Handlebars-style template replacement with conditional blocks
 */
export function processTemplate(template: string, context: PromptContext): string {
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
      : context.character.personality || "No personality description available";
  prompt = prompt.replace(/\{\{character\.personality\}\}/g, personality);

  const background = context.character.background || "No background information available";
  prompt = prompt.replace(/\{\{character\.background\}\}/g, background);

  // Convert JSONB data to natural language for better LLM understanding
  const physicalAttributes =
    typeof context.character.appearance === "object"
      ? appearanceToText(context.character.appearance)
      : context.character.appearance || "No physical description available";
  prompt = prompt.replace(/\{\{character\.appearance\}\}/g, physicalAttributes);

  // Also handle personality and scents with proper conversion
  if (context.character.personality) {
    const personalityText =
      typeof context.character.personality === "object"
        ? personalityToText(context.character.personality)
        : context.character.personality;
    prompt = prompt.replace(/\{\{character\.personality\}\}/g, personalityText);
  }

  if (context.character.scents_aromas) {
    const scentsText =
      typeof context.character.scents_aromas === "object"
        ? scentsToText(context.character.scents_aromas)
        : context.character.scents_aromas;
    prompt = prompt.replace(/\{\{character\.scents_aromas\}\}/g, scentsText);
  }

  const scentsAromas =
    typeof context.character.scents_aromas === "object"
      ? JSON.stringify(context.character.scents_aromas)
      : context.character.scents_aromas || "No distinctive scents or traits";
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
      /\{\{setting\.world_type\}\}/g,
      context.setting.world_type || "Unknown type"
    );
  } else {
    // Remove setting conditional block if no setting
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
    // Remove location conditional block if no location
    prompt = prompt.replace(/\{\{#if location\}\}[\s\S]*?\{\{\/if\}\}/g, "");
  }

  // Clean up any remaining template syntax
  prompt = prompt.replace(/\{\{[^}]*\}\}/g, "[Data not available]");

  // Clean up extra whitespace
  prompt = prompt.replace(/\n\s*\n\s*\n/g, "\n\n").trim();

  return prompt;
}
