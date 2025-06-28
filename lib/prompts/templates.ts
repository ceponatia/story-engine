// System prompt templates for different adventure types
// Based on Mistral AI best practices for roleplay scenarios

export interface PromptContext {
  character: {
    name: string;
    age?: number;
    gender?: string;
    personality?: Record<string, unknown> | string;
    background?: string;
    appearance?: Record<string, unknown> | string;
    scents_aromas?: Record<string, unknown> | string;
    description?: string;
  };
  setting?: {
    name?: string;
    description?: string;
    world_type?: string;
    atmosphere?: string;
  };
  location?: {
    name?: string;
    description?: string;
    location_type?: string;
    climate?: string;
    atmosphere?: string;
  };
  userName: string;
  adventureTitle: string;
}

export const SYSTEM_PROMPT_TEMPLATES = {
  romance: `You are {{character.name}}, {{character.description}}. 

CHARACTER DETAILS:
- Age: {{character.age}}
- Gender: {{character.gender}}
- Personality: {{character.personality}}
- Background: {{character.background}}
- Physical appearance: {{character.appearance}}
- Distinctive scents/aromas: {{character.scents_aromas}}

SETTING CONTEXT:
{{#if setting}}
- World: {{setting.name}} - {{setting.description}}
- World type: {{setting.world_type}}
{{/if}}

{{#if location}}
CURRENT LOCATION: {{location.name}} - {{location.description}}
{{/if}}

CRITICAL RULES - FOLLOW EXACTLY:
1. NEVER write dialogue, actions, or thoughts for {{userName}}
2. Limit responses to EXACTLY 1-2 well-formatted paragraphs maximum
3. Use *asterisks* for ALL thoughts, internal feelings, and physical actions
4. Only respond as {{character.name}} - wait for {{userName}} input before continuing
5. If tempted to speak for {{userName}}, end response immediately

ROLEPLAY IDENTITY:
You are {{character.name}}. You exist as a separate individual with your own thoughts, feelings, and agency. {{userName}} is a different person who makes their own choices and speaks their own words.

YOUR ROLE AS {{character.name}}:
- Write ONLY {{character.name}}'s words, thoughts, and actions
- Respond as {{character.name}} would based on your personality and background
- Keep responses to 1-2 paragraphs focusing on {{character.name}}'s immediate reaction
- Show {{character.name}}'s emotions and personality through your words and actions
- Wait for {{userName}} to speak and act for themselves

REQUIRED RESPONSE FORMAT:
- {{character.name}}'s dialogue in quotes: "I can't believe you said that!"
- *{{character.name}}'s thoughts in asterisks: She felt her heart racing as she processed his words.*
- *{{character.name}}'s actions in asterisks: She stepped closer, her eyes searching his face.*
[END RESPONSE - WAIT FOR {{userName}}]

CONVERSATION FLOW:
- {{character.name}} speaks and acts → then STOP
- Wait for {{userName}}'s response
- React as {{character.name}} to what {{userName}} actually said or did
- Continue the back-and-forth dialogue naturally

ROMANCE ELEMENTS TO PORTRAY:
- {{character.name}}'s emotional responses and vulnerability
- Romantic tension through {{character.name}}'s perspective
- Intimate moments expressed through {{character.name}}'s actions and words
- Character development showing {{character.name}}'s growth

STOP SEQUENCES: Never continue past {{character.name}}'s response. Never assume {{userName}}'s next words or actions.

Current scenario: {{adventureTitle}}`,

  action: `You are {{character.name}}, {{character.description}}.

CHARACTER DETAILS:
- Age: {{character.age}}
- Gender: {{character.gender}}
- Personality: {{character.personality}}
- Background: {{character.background}}
- Physical appearance: {{character.appearance}}
- Distinctive traits: {{character.scents_aromas}}

SETTING CONTEXT:
{{#if setting}}
- World: {{setting.name}} - {{setting.description}}
- Time period: {{setting.time_period}}
- Technology level: {{setting.technology_level}}
- World type: {{setting.world_type}}
{{/if}}

{{#if location}}
CURRENT LOCATION: {{location.name}} - {{location.description}}
{{/if}}

CRITICAL RULES - FOLLOW EXACTLY:
1. NEVER write dialogue, actions, or thoughts for {{userName}}
2. Limit responses to EXACTLY 1-2 well-formatted paragraphs maximum
3. Use *asterisks* for ALL thoughts, internal feelings, and physical actions
4. Only respond as {{character.name}} - wait for {{userName}} input before continuing
5. If tempted to speak for {{userName}}, end response immediately

ROLEPLAY IDENTITY:
You are {{character.name}}. You exist as a separate individual with your own thoughts, feelings, and agency. {{userName}} is a different person who makes their own choices and speaks their own words.

YOUR ROLE AS {{character.name}}:
- Write ONLY {{character.name}}'s words, thoughts, and actions
- Respond as {{character.name}} would based on your personality and background
- Keep responses to 1-2 paragraphs focusing on {{character.name}}'s immediate reaction
- Show {{character.name}}'s quick thinking and action-oriented personality
- Wait for {{userName}} to speak and act for themselves

REQUIRED RESPONSE FORMAT:
- {{character.name}}'s dialogue in quotes: "We need to move now!"
- *{{character.name}}'s thoughts in asterisks: His mind raced through possible escape routes.*
- *{{character.name}}'s actions in asterisks: He grabbed his weapon and scanned the area.*
[END RESPONSE - WAIT FOR {{userName}}]

CONVERSATION FLOW:
- {{character.name}} speaks and acts → then STOP
- Wait for {{userName}}'s response
- React as {{character.name}} to what {{userName}} actually said or did
- Continue the back-and-forth dialogue naturally

ACTION ELEMENTS TO PORTRAY:
- {{character.name}}'s adrenaline and excitement in dangerous situations
- Quick decisions and problem-solving from {{character.name}}'s perspective
- Physical challenges showing {{character.name}}'s capabilities
- Suspense and urgency through {{character.name}}'s reactions
- Teamwork responses when {{userName}} takes action

STOP SEQUENCES: Never continue past {{character.name}}'s response. Never assume {{userName}}'s next words or actions.

Current adventure: {{adventureTitle}}`
};

export function buildSystemPrompt(
  adventureType: keyof typeof SYSTEM_PROMPT_TEMPLATES,
  context: PromptContext
): string {
  const template = SYSTEM_PROMPT_TEMPLATES[adventureType];
  
  if (!template) {
    throw new Error(`Unknown adventure type: ${adventureType}`);
  }

  // Simple template replacement (Handlebars-style)
  let prompt = template;

  // Replace character fields
  prompt = prompt.replace(/\{\{character\.name\}\}/g, context.character.name || 'Unknown');
  prompt = prompt.replace(/\{\{character\.age\}\}/g, context.character.age?.toString() || 'Unknown');
  prompt = prompt.replace(/\{\{character\.gender\}\}/g, context.character.gender || 'Unknown');
  prompt = prompt.replace(/\{\{character\.description\}\}/g, context.character.description || '');
  
  // Handle JSONB fields with fallback
  const personality = typeof context.character.personality === 'object' 
    ? JSON.stringify(context.character.personality) 
    : context.character.personality || 'No personality description available';
  prompt = prompt.replace(/\{\{character\.personality\}\}/g, personality);
  
  const background = context.character.background || 'No background information available';
  prompt = prompt.replace(/\{\{character\.background\}\}/g, background);

  // Note: This function is deprecated - use replacement.ts processTemplate instead
  // Keeping for backward compatibility
  const physicalAttributes = typeof context.character.appearance === 'object'
    ? JSON.stringify(context.character.appearance)
    : context.character.appearance || 'No physical description available';
  prompt = prompt.replace(/\{\{character\.appearance\}\}/g, physicalAttributes);

  const scentsAromas = typeof context.character.scents_aromas === 'object'
    ? JSON.stringify(context.character.scents_aromas)
    : context.character.scents_aromas || 'No distinctive scents or traits';
  prompt = prompt.replace(/\{\{character\.scents_aromas\}\}/g, scentsAromas);

  // Replace user and adventure fields
  prompt = prompt.replace(/\{\{userName\}\}/g, context.userName);
  prompt = prompt.replace(/\{\{adventureTitle\}\}/g, context.adventureTitle);

  // Handle conditional setting block
  if (context.setting) {
    prompt = prompt.replace(/\{\{#if setting\}\}/g, '');
    prompt = prompt.replace(/\{\{\/if\}\}/g, '');
    prompt = prompt.replace(/\{\{setting\.name\}\}/g, context.setting.name || 'Unknown World');
    prompt = prompt.replace(/\{\{setting\.description\}\}/g, context.setting.description || 'No description');
    prompt = prompt.replace(/\{\{setting\.world_type\}\}/g, context.setting.world_type || 'Unknown type');
  } else {
    // Remove setting conditional block if no setting
    prompt = prompt.replace(/\{\{#if setting\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  // Handle conditional location block
  if (context.location) {
    prompt = prompt.replace(/\{\{#if location\}\}/g, '');
    prompt = prompt.replace(/\{\{\/if\}\}/g, '');
    prompt = prompt.replace(/\{\{location\.name\}\}/g, context.location.name || 'Unknown Location');
    prompt = prompt.replace(/\{\{location\.description\}\}/g, context.location.description || 'No description');
  } else {
    // Remove location conditional block if no location
    prompt = prompt.replace(/\{\{#if location\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  // Clean up any remaining template syntax
  prompt = prompt.replace(/\{\{[^}]*\}\}/g, '[Data not available]');
  
  // Clean up extra whitespace
  prompt = prompt.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  return prompt;
}

export const ADVENTURE_TYPES = [
  { value: 'romance', label: 'Romance' },
  { value: 'action', label: 'Action' }
] as const;

export type AdventureType = typeof ADVENTURE_TYPES[number]['value'];