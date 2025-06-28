# CLAUDE.md - Prompts Module

This file provides guidance to Claude Code when working with the prompt system in `/lib/prompts/`.
Read the system-prompt-notes.md file to get more information on how to build prompts

## Module Overview

The prompts module handles AI system prompt generation for adventure-based storytelling. It creates character-specific prompts for the Mistral AI model via Ollama, supporting different adventure types with structured template replacement.

**ARCHITECTURE UPDATE**: The module has been restructured into a modular system while maintaining full backward compatibility.

## Core Files

### `templates.ts` (Legacy - Maintained for Compatibility)
- **Legacy Module**: Original monolithic template system
- **Status**: Preserved for backward compatibility
- **Usage**: `await import('@/lib/prompts/templates')` continues to work

### `index.ts` (New Entry Point)
- **Primary Module**: Main entry point with backward compatibility
- **Key Exports**: 
  - `SYSTEM_PROMPT_TEMPLATES` - Template definitions for adventure types
  - `buildSystemPrompt()` - Template processing function
  - `PromptContext` - TypeScript interface for template data
  - `ADVENTURE_TYPES` - Available adventure type constants

### Modular Structure
```
/lib/prompts/
├── index.ts              # Main entry point - backward compatible
├── types.ts              # Shared interfaces and types
├── core.ts               # Template processing engine
├── registry.ts           # Template discovery system
├── templates/
│   ├── index.ts          # Auto-exports all templates
│   ├── romance.ts        # Optimized romance template (60% smaller)
│   └── action.ts         # Optimized action template (60% smaller)
└── utils/
    ├── replacement.ts    # String replacement utilities
    └── validation.ts     # Template validation
```

## Architecture

### Template System
- **Handlebars-style syntax**: `{{character.name}}`, `{{setting.description}}`
- **Conditional blocks**: `{{#if setting}}...{{/if}}` for optional content
- **Adventure types**: Currently supports `romance` and `action` templates
- **Character-centric**: Templates focus on single character roleplay

### Context Structure
```typescript
PromptContext {
  character: {
    name, age, gender, personality, background,
    physical_attributes, scents_aromas, description
  },
  setting?: { name, description, world_type, time_period, etc. },
  location?: { name, description, location_type, etc. },
  userName: string,
  adventureTitle: string
}
```

### Template Processing
1. **Character field replacement**: Direct string substitution with fallbacks
2. **JSONB handling**: Converts objects to JSON strings for complex fields
3. **Conditional rendering**: Removes blocks when context data missing
4. **Cleanup**: Removes unused template syntax and extra whitespace

## Integration Points

### Database Integration
- **Adventure Creation**: `app/actions/adventures.ts:69` imports and uses `buildSystemPrompt()`
- **Character Data**: Templates use character data from `adventure_characters` table
- **Setting/Location**: Templates support optional setting and location context

### AI Integration
- **Ollama Client**: Templates consumed by Mistral model via `/lib/ai/ollama/`
- **Model Optimization**: Templates designed for `mistral:instruct` format
- **Generation Config**: Used with presets from `/lib/ai/config/ollama.ts`

## Current Template Design

### Character-Only Focus
- **Single character roleplay**: User interacts with one AI character
- **Strict boundaries**: Templates prevent AI from writing for the user
- **Response formatting**: Uses asterisks for thoughts/actions, quotes for dialogue
- **Length limits**: Enforces 1-2 paragraph responses maximum

### Adventure Types
- **Romance**: Emotional focus, vulnerability, romantic tension (optimized from 97 lines to 38 lines)
- **Action**: High-energy, quick decisions, physical challenges (optimized from 95 lines to 36 lines)
- **Extensible**: Auto-registration system for new template types

### Template Optimization Benefits
- **60%+ reduction in verbosity**: Improved Mistral model performance
- **Preserved functionality**: All critical rules and formatting maintained
- **Better AI responses**: Cleaner, more focused prompts for better model output

## Key Template Rules

### Critical Constraints
1. **Never write for user**: Templates strictly prevent AI from controlling user character
2. **Response length**: Maximum 1-2 paragraphs per response
3. **Format requirements**: Asterisks for actions/thoughts, quotes for dialogue
4. **Wait for user**: AI must stop and wait for user input

### Response Format
```
"Character dialogue goes here."
*Character's internal thoughts and physical actions go here.*
[END RESPONSE - WAIT FOR USER]
```

## Known Optimization Needs

### Template Verbosity
- **Current issue**: Templates are 160+ lines, reducing AI effectiveness
- **Target**: Streamline to 50-80 lines for better Mistral performance
- **Priority**: High - affects response quality

### Missing Features
- **State extraction**: No automated tracking of character actions from responses
- **Memory system**: No conversation summarization or long-term character memory
- **Model-specific formatting**: Not optimized for Mistral's chat template format

## Development Patterns

### Adding New Adventure Types (New Modular System)
1. Create new template file in `/lib/prompts/templates/[type].ts`
2. Export template object with content, metadata, and validation
3. System automatically discovers and registers the template
4. No manual updates required to constants or UI forms

### Legacy Method (Still Supported)
1. Add template to `SYSTEM_PROMPT_TEMPLATES` object in templates.ts
2. Update `ADVENTURE_TYPES` constant
3. Update `AdventureType` type definition
4. Test with `buildSystemPrompt()` function

### Template Modification
- **Maintain format**: Keep Handlebars-style syntax consistent
- **Test conditionals**: Ensure `{{#if}}` blocks work with missing data
- **Validate context**: Check all `PromptContext` fields are handled
- **Character focus**: Maintain single-character roleplay boundaries

## Future Enhancements

### Planned Improvements
- **Mistral-optimized prompts**: Shorter, more focused templates
- **Automated state tracking**: Extract character actions from AI responses
- **Character memory**: Conversation summarization and persistent memory
- **Dynamic templates**: Context-aware template selection

### Integration Opportunities
- **Character development**: Track personality changes over adventures
- **World consistency**: Maintain setting/location state across conversations
- **User preferences**: Customize template style per user

## Environment Context

- **Model**: Designed for `mistral:instruct` via Ollama
- **Database**: PostgreSQL with character/setting/location data
- **Framework**: Next.js 15 server actions for template processing
- **Type safety**: Full TypeScript integration with strict types