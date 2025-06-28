// Template validation utilities

import type { PromptContext, Template } from '../types';

/**
 * Validate that required context fields are present
 */
export function validateContext(context: PromptContext): boolean {
  if (!context.character?.name) {
    throw new Error('Character name is required');
  }
  
  if (!context.userName) {
    throw new Error('User name is required');
  }
  
  if (!context.adventureTitle) {
    throw new Error('Adventure title is required');
  }
  
  return true;
}

/**
 * Validate template structure
 */
export function validateTemplate(template: Template): boolean {
  if (!template.content) {
    throw new Error('Template content is required');
  }
  
  if (!template.metadata?.type) {
    throw new Error('Template metadata.type is required');
  }
  
  if (!template.metadata?.label) {
    throw new Error('Template metadata.label is required');
  }
  
  return true;
}

/**
 * Validate template content for required placeholders
 */
export function validateTemplatePlaceholders(content: string): boolean {
  const requiredPlaceholders = [
    '{{character.name}}',
    '{{userName}}',
    '{{adventureTitle}}'
  ];
  
  for (const placeholder of requiredPlaceholders) {
    if (!content.includes(placeholder)) {
      throw new Error(`Template missing required placeholder: ${placeholder}`);
    }
  }
  
  return true;
}