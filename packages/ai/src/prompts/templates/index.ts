// Auto-export system for template modules

export { romanceTemplate } from "./romance";
export { actionTemplate } from "./action";

// Template collection for easy access
import { romanceTemplate } from "./romance";
import { actionTemplate } from "./action";

export const OPTIMIZED_TEMPLATES = {
  romance: romanceTemplate,
  action: actionTemplate,
} as const;

// Legacy format for backward compatibility
export const SYSTEM_PROMPT_TEMPLATES = {
  romance: romanceTemplate.content,
  action: actionTemplate.content,
} as const;
