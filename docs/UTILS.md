# Utilities Documentation

## Parser Functions

### Character Attribute Parsing

The character attribute parsing functionality has been moved to the `@story-engine/domain/characters` package.

#### `attributeToText`

**Location**: `packages/domain/characters/src/unifiedParser.ts`

**Import**: `import { attributeToText } from "@story-engine/domain/characters";`

**Purpose**: Converts structured character attribute data back to natural language text for display in forms and UI components.

**Usage**:
```typescript
import { attributeToText } from "@story-engine/domain/characters";

// Convert JSONB attribute data to readable text
const displayText = attributeToText({
  "hair.color": ["brown", "dark"],
  "eyes.appearance": ["blue", "bright"]
});
// Result: "Hair (color): brown, dark; Eyes: blue, bright"
```

#### `formatTagName`

**Location**: `packages/domain/characters/src/utils.ts`

**Purpose**: Formats tag names by capitalizing the first letter of each word.

**Usage**:
```typescript
import { formatTagName } from "@story-engine/domain/characters";

const formatted = formatTagName("hair color");
// Result: "Hair Color"
```

### Related Functions

- `parseAttributeText`: Parses natural language to structured data
- `parseAppearanceText`: Convenience function for appearance attributes
- `parsePersonalityText`: Convenience function for personality attributes
- `parseScentsText`: Convenience function for scent attributes

## Import Guidelines

### Character Actions

Character actions have been moved to use dot notation:

```typescript
//  Correct
import { createCharacterAction, updateCharacterAction } from "@/lib/actions/character.actions";

// L Incorrect (deprecated)
import { createCharacterAction, updateCharacterAction } from "@/lib/actions/character-actions";
```

### Parser Functions

Parser functions should be imported from the domain package:

```typescript
//  Correct
import { attributeToText } from "@story-engine/domain/characters";

// L Incorrect (deprecated)
import { attributeToText } from "@/lib/parsers/unified-parser";
```

## Package Structure

The utility functions are organized across multiple packages:

- `@story-engine/domain/characters`: Character-specific parsing and formatting
- `@/lib/utils`: General web application utilities (cn, hasDbConfig, etc.)
- `@story-engine/utils`: Shared utilities for search and filtering