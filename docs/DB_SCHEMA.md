# DB_SCHEMA.md

> This document describes the PostgreSQL schema currently used in the project. PostgreSQL is used for storing structured data like users, structured gameplay logs, and versioned historical records. This schema is expected to stabilize as MongoDB takes over more of the dynamic narrative structures.

---

## 🧩 Tables Overview

### `character_field_rules`

Defines protection, mutability, and inference criteria for specific character fields (e.g., appearance, traits). Enables the LLM to manage updates in a semi-restricted way.

| Column                  | Type         | Description |
|-------------------------|--------------|-------------|
| id                      | TEXT         | Primary key, UUID |
| field_path              | TEXT         | Dot notation for JSON path (e.g., appearance.hair.color) |
| protection_level        | VARCHAR(20)  | `immutable`, `protected`, or `mutable` |
| min_confidence          | DECIMAL(3,2) | Required LLM confidence to apply update |
| protection_reason       | TEXT         | Human-readable explanation |
| max_changes_per_adventure | INTEGER   | Optional rate limiter |
| change_cooldown_minutes | INTEGER      | Optional cooldown timer |
| requires_explicit_mention | BOOLEAN    | Must be stated outright |
| requires_character_agency | BOOLEAN    | Character must be actor of change |
| is_active               | BOOLEAN      | Rule is in effect |
| category                | VARCHAR(50)  | Grouping/category (e.g. `genetics`) |
| priority                | INTEGER      | Higher = stronger enforcement |
| created_at              | TIMESTAMPTZ  | Audit field |
| updated_at              | TIMESTAMPTZ  | Audit field (auto-updated via trigger) |

🔁 **Triggers:**  
- Updates `updated_at` automatically on changes.

📊 **Indexes:**  
- `field_path` (unique)  
- `is_active` (partial)  
- `category`

✅ **Use Case:** This table remains authoritative even post-MongoDB migration. It provides governance metadata used by the LLM to apply or reject character updates in a structured, rule-bound manner.

---

### `character_field_changes`

Audit log of all dynamic field changes to a character, including source, reason, and confidence.

| Column                  | Type         | Description |
|-------------------------|--------------|-------------|
| id                      | TEXT         | UUID |
| adventure_character_id  | TEXT         | FK (soft ref) to in-game instance (stored in MongoDB) |
| field_path              | TEXT         | JSON path |
| previous_value          | JSONB        | From |
| new_value               | JSONB        | To |
| confidence_score        | DECIMAL(3,2) | Confidence of change |
| source_text             | TEXT         | What the user or LLM said |
| change_source           | VARCHAR(20)  | Source: LLM, manual, system |
| changed_at              | TIMESTAMPTZ  | When |
| triggering_message_id   | TEXT         | FK (soft ref) to `adventure_messages` |

📊 **Indexes:**  
- Adventure character lookup  
- Field path lookup  
- Timestamp  
- Composite index for rate limiting

✅ **Use Case:** This table supports full auditability. It acts as a transaction log for changes to MongoDB-based characters.

💡 **Recommendations:**
- Clearly document that `adventure_character_id` refers to a MongoDB document ID or UUID
- Optionally add:
  - `mongo_character_id` (for explicit MongoDB reference)
  - `llm_model` or `llm_version` (to support traceability and debugging)

---

## 🧪 Functions

### `is_field_change_allowed(...)`
Validates whether a proposed field change is compliant with schema constraints.

### `record_field_change(...)`
Inserts a record of an accepted change and returns its ID.

---

## ⚠️ Claude Instructions

> When modifying Postgres data:
- Do not use PostgreSQL for storing in-game characters, traits, or locations — this is handled by MongoDB now.
- Only use these tables for controlling update *logic* and audit *recording* of character modifications.
- `field_path` keys must align with paths in MongoDB-stored character JSON.
- `adventure_character_id` is a reference to a MongoDB record, not a Postgres FK.

## 📦 Entity Types & Repository Structure

> Database-agnostic entity types are now stored in: `packages/types/src/entities/`
> MongoDB-specific document types and repositories are in: `packages/types/src/mongodb/`

### Entity Types Location
- **Character entities**: `@story-engine/types/entities/character` - Database-agnostic Character and CharacterFormData interfaces
- **Location entities**: `@story-engine/types/entities/location` - Database-agnostic Location and LocationFormData interfaces  
- **Setting entities**: `@story-engine/types/entities/setting` - Database-agnostic Setting and SettingFormData interfaces

### MongoDB Repository Location
- **Character repositories**: `packages/mongodb/src/repositories/character.repository.ts` - MongoDB-specific CharacterDocument and IMongoCharacterRepository
- **Location repositories**: `packages/mongodb/src/repositories/location.repository.ts` - MongoDB-specific LocationDocument and IMongoLocationRepository
- **Setting repositories**: `packages/mongodb/src/repositories/setting.repository.ts` - MongoDB-specific SettingDocument and IMongoSettingRepository

### Import Guidelines
```typescript
// ✅ For database-agnostic entity types
import { Character, CharacterFormData } from "@story-engine/types";

// ✅ For MongoDB-specific document types
import { CharacterDocument, IMongoCharacterRepository } from "@story-engine/types";

// ✅ For MongoDB repositories
import { MongoCharacterRepository } from "@story-engine/mongodb";
```

---

## 🚧 Migration In Progress

Tables like `users`, `adventure_messages`, `characters`, and `adventures` still exist in PostgreSQL but are expected to be deprecated or simplified. MongoDB will store most game entities by the final version.

## 👤 `users`

Handles registered user accounts, authentication methods, and preference fields.

| Column         | Type         | Description |
|----------------|--------------|-------------|
| id             | TEXT (UUID)  | Primary key |
| username       | TEXT         | Unique login name |
| email          | TEXT         | Email address |
| password_hash  | TEXT         | Secure hash |
| auth_provider  | VARCHAR(20)  | e.g., 'local', 'oauth' |
| created_at     | TIMESTAMPTZ  | Registered on |
| updated_at     | TIMESTAMPTZ  | Updated profile info |

📊 **Indexes**:
- `username` (unique)
- `email` (unique)

---

## 🗺️ `adventures`

Represents a running game session. Contains metadata and state info for each narrative playthrough.

| Column         | Type         | Description |
|----------------|--------------|-------------|
| id             | TEXT (UUID)  | Primary key |
| user_id        | TEXT         | FK to `users` |
| title          | TEXT         | Custom title for this session |
| system         | TEXT         | Game system or mode (e.g., 'romance', 'fantasy') |
| created_at     | TIMESTAMPTZ  | Created time |
| updated_at     | TIMESTAMPTZ  | Modified time |

📊 **Indexes**:
- `user_id`
- `system`

---

## 🧾 `adventure_messages`

Logs all dialogue, narration, and user interaction events in order. Key table for maintaining LLM chat context.

| Column         | Type         | Description |
|----------------|--------------|-------------|
| id             | TEXT (UUID)  | Primary key |
| adventure_id   | TEXT         | FK to `adventures` |
| speaker_id     | TEXT         | FK or identifier (user or character or narrator) |
| message_type   | TEXT         | 'dialogue', 'narration', 'system', etc. |
| content        | TEXT         | Message body |
| content_embedding | VECTOR    | Vectorized content for Qdrant |
| emotion_embedding | VECTOR    | Emotional signature of the message |
| created_at     | TIMESTAMPTZ  | Timestamp |

📊 **Indexes**:
- `adventure_id`
- `created_at`
- `speaker_id`

---

## ⚠️ Claude Guidance for These Tables

- `users` must remain in PostgreSQL — do not attempt to move this to MongoDB.
- `adventures` is used to group MongoDB-based characters and messages.
- `adventure_messages` is the authoritative source of message chronology and must be kept consistent with both Redis memory and Qdrant embeddings.
- Do not modify or remove `message_type`, `speaker_id`, or `created_at` fields — they are critical to chat sequencing and LLM context input.
"""