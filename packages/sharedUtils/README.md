# @story-engine/shared-utils

Shared utilities package containing common non-domain-specific tools, parsers, updaters, and infrastructure utilities for Story Engine.

## Features

- **Parsers**: Generic parsing utilities and helpers
- **Updaters**: Common update patterns and utilities  
- **Infrastructure**: Circuit breakers, metrics, error handling, fallback managers
- **Utilities**: Shared helper functions and tools

## Structure

```
packages/shared-utils/
├── src/
│   ├── parsers/
│   │   ├── base-parser.ts           ← Generic parsing utilities
│   │   ├── validation-parser.ts     ← Validation helpers
│   │   └── text-parser.ts           ← Text processing utilities
│   │
│   ├── updaters/
│   │   ├── base-updater.ts          ← Generic update patterns
│   │   ├── field-updater.ts         ← Field update utilities
│   │   └── merge-updater.ts         ← Merge strategies
│   │
│   ├── infrastructure/
│   │   ├── circuit-breaker.ts       ← Circuit breaker pattern
│   │   ├── metrics.ts               ← Metrics collection
│   │   ├── error-handler.ts         ← Error handling utilities
│   │   ├── fallback-manager.ts      ← Fallback strategies
│   │   ├── retry.ts                 ← Retry logic
│   │   └── health-check.ts          ← Health monitoring
│   │
│   └── index.ts                     ← Public API exports
│
├── package.json
└── README.md
```

## Usage

### Infrastructure Utilities

```typescript
import { 
  CircuitBreaker,
  MetricsCollector,
  ErrorHandler,
  FallbackManager 
} from '@story-engine/shared-utils/infrastructure';

// Circuit breaker for external services
const breaker = new CircuitBreaker({
  timeout: 5000,
  errorThreshold: 5,
  resetTimeout: 30000
});

// Metrics collection
const metrics = new MetricsCollector();
metrics.increment('api.requests');
metrics.timing('api.response_time', 150);

// Error handling
const errorHandler = new ErrorHandler({
  logErrors: true,
  includeStackTrace: false
});
```

### Parsers

```typescript
import { 
  BaseParser,
  ValidationParser,
  TextParser 
} from '@story-engine/shared-utils/parsers';

// Generic text parsing
const parser = new TextParser();
const result = parser.extractKeyValuePairs(text);

// Validation with custom schemas
const validator = new ValidationParser(schema);
const validated = validator.parse(data);
```

### Updaters

```typescript
import { 
  BaseUpdater,
  FieldUpdater,
  MergeUpdater 
} from '@story-engine/shared-utils/updaters';

// Field-level updates
const updater = new FieldUpdater();
const updated = updater.updateField(object, 'field', newValue);

// Merge strategies
const merger = new MergeUpdater();
const merged = merger.deepMerge(existing, updates);
```

## Design Principles

- **Framework Agnostic**: No dependencies on domain-specific logic
- **Reusable**: Common patterns used across multiple packages
- **Type Safe**: Full TypeScript support with proper generics
- **Performance**: Optimized for high-throughput scenarios
- **Extensible**: Easy to extend and customize for specific needs