# @story-engine/world

World domain package providing comprehensive location and setting management for Story Engine adventures.

## Features

- **Location Management**: Create, read, update, delete location entities
- **Setting Management**: Manage adventure settings and world configurations
- **Repository Pattern**: Clean data access layer with MongoDB integration
- **Type Safety**: Full TypeScript support with Zod validation
- **Unified World Logic**: Combined location and setting business rules

## Structure

```
packages/world/
├── src/
│   ├── repositories/
│   │   ├── location.repository.ts    ← Location data access
│   │   └── setting.repository.ts     ← Setting data access
│   │
│   ├── schemas/
│   │   ├── location.schema.ts        ← Zod validators for locations
│   │   └── setting.schema.ts         ← Zod validators for settings
│   │
│   ├── types/
│   │   ├── location.types.ts         ← Location types/interfaces
│   │   └── setting.types.ts          ← Setting types/interfaces
│   │
│   ├── updaters/
│   │   ├── location.updater.ts       ← Location mutation logic
│   │   └── setting.updater.ts        ← Setting mutation logic
│   │
│   └── index.ts                      ← Public API exports
│
├── package.json
└── README.md
```

## Usage

### Locations

```typescript
import { 
  locationRepository,
  LocationSchema,
  type Location 
} from '@story-engine/world';

// Create location
const location = await locationRepository.create({
  name: 'Enchanted Forest',
  description: 'A mystical forest filled with ancient magic',
  features: ['magical', 'ancient', 'mysterious']
});

// Get location by ID
const foundLocation = await locationRepository.findById(locationId);

// Update location
await locationRepository.update(locationId, { 
  description: 'Updated description' 
});
```

### Settings

```typescript
import { 
  settingRepository,
  SettingSchema,
  type Setting 
} from '@story-engine/world';

// Create setting
const setting = await settingRepository.create({
  name: 'Medieval Fantasy',
  description: 'A world of knights, magic, and ancient kingdoms',
  genre: 'fantasy',
  elements: ['magic', 'kingdoms', 'quests']
});

// Get setting by ID
const foundSetting = await settingRepository.findById(settingId);
```

## Domain Logic

The package handles:
- Location and setting validation with Zod schemas
- Business rules for world entity management
- MongoDB integration through repository pattern
- Type-safe operations with proper error handling
- Unified world state management

## Data Models

### Locations
- Basic information (name, description)
- Features and attributes
- Geographical relationships
- Adventure connections

### Settings
- World configuration (name, genre, description)
- Cultural and political elements
- Historical context
- Rule systems