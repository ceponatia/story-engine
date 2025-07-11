# @story-engine/utils

Shared utilities for the Story Engine monorepo.

## Overview

This package contains common utilities used across the Story Engine application, including:

- **Filter utilities** - Result filtering and processing
- **Search utilities** - Conversation parsing, search parsing, and similarity parsing
- **Parser utilities** - Various data parsing functions

## Structure

```
src/
   filter/
      result.filter.ts          # Result filtering utilities
   search/
      conversation.parser.ts    # Conversation parsing utilities
      search.parser.ts          # Search parsing utilities
      similarity.parser.ts      # Similarity parsing utilities
   index.ts                      # Barrel exports
```

## Usage

Import utilities directly from the package:

```typescript
import { 
  // Filter utilities
  // Search utilities
  // Parser utilities
} from '@story-engine/utils';
```

## Development

```bash
# Build the package
pnpm build

# Watch for changes
pnpm dev

# Run tests
pnpm test

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## TypeScript

This package uses strict TypeScript configuration and requires all exports to be properly typed.