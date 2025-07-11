// CLAUDE.md — Core Project Guide for Claude Code

This is a monorepo.

// Strict Typing Enforcement
// -------------------------

You MUST write valid TypeScript that passes `strict` mode with zero type warnings or errors.

- Do not use `any`, unsafe type assertions, or incomplete interfaces.
- All function parameters and return types must be explicitly typed.
- Avoid leaving `TODO` types or inferred shapes.
- Always reference existing helper types, Zod schemas, and interfaces.

Use camelCase for:
- Variable names: characterForm, userSession, updateCharacterStats
- file names inside components or logic folders: characterForm.ts, locationParser.ts
Use PascalCase for:
- Component names: CharacterForm, AdventureSidebar
- Never use kebab-case (like character-form.ts) — this breaks imports and violates our project conventions
Alwasy use dot case for file clarity where helpful, e.g.: forms, schema, repositories, updaters, etc.
- character.form.ts for a Zod form definition
- setting.schema.ts for Mongo validators
- location.updater.ts for data mutation logic

Use `ripgrep (rg)` instead of `grep` for all search operations.
If missing filetypes, add: `echo "--type-add=tsx:*.tsx" >> ~/.ripgreprc`

// Package Management
// -------------------------

This project uses pnpm with workspaces and Turborepo for build orchestration.

- Use `pnpm install` instead of `npm install`
- Use `pnpm run <script>` instead of `npm run <script>`
- All workspace packages are linked automatically via `pnpm-workspace.yaml`
- Package references use `workspace:*` syntax for internal dependencies

// Pathing & Utilities
// -------------------------

- Use `/lib/utils/index.ts` to import shared helpers and avoid duplicating logic.
- Utility helpers live in `/lib/utils/`, subdivided by purpose (e.g. `/updaters`, `/parsers`, `/modifiers`)
- Use only officially exported modules from barrel files (`index.ts`) in folders.

// Project Reference Files
// -------------------------

- /docs/ folder lists .md files for all project architecture. Reference these files when you have questions.

// Project Description
// -------------------------

Story Engine is a roleplaying chat application built in Next.js 15 with a multi-database backend and Mistral via Ollama for AI character simulation. Characters, locations, and items are created and persist across interactive AI-powered conversations.

Key Technologies:
- Frontend: React 19 + TypeScript, Tailwind, Radix UI
- Backend: PostgreSQL (users/auth), Redis (sessions/cache), MongoDB (objects), Qdrant (semantic memory)
- AI: Ollama + mistral:instruct
- Dev Stack: Docker, Jest, ESLint, Turbopack

Core Concepts:
- Character state persists and evolves within "adventures"
- Base characters are immutable; clones are mutated during gameplay
- Chat histories stored in PostgreSQL; character/object data lives in MongoDB; embeddings in Qdrant

// Development Setup
// -------------------------

To start development:

```bash
docker-compose up -d              # Start DBs
ollama run mistral:instruct       # Start AI
pnpm dev                          # Run frontend (uses Turborepo)
```

Test and validate:
```bash
pnpm lint                         # Linting (uses Turborepo)
pnpm test                         # Unit tests (uses Turborepo)
pnpm test:watch                   # Watch mode
pnpm check:naming                 # Check naming conventions
pnpm check:env-loading            # Validate environment loading patterns
```

Database access:
- Use `getDatabase()` from `@/lib/postgres/pool`
- Do not use old `connection.ts` files
- User accounts are in the `user` table (Better Auth)

// Health Check Shortcuts
// -------------------------

```bash
docker-compose ps                        # Status of containers

# Redis
docker exec storyengine_redis redis-cli ping

# MongoDB
docker exec storyengine_mongodb mongosh --eval "db.runCommand('ping')"

# Qdrant
curl http://localhost:6333/health

# PostgreSQL
docker exec storyengine_db psql -U claude -d storyengine
```

// Environment Configuration
// -------------------------

```env
DATABASE_URL=postgresql://claude:...@localhost:5432/storyengine
REDIS_URL=redis://localhost:6379
QDRANT_URL=http://localhost:6333
MONGODB_URL=mongodb://storyengine:...@localhost:27017/storyengine
BETTER_AUTH_SECRET=...
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:instruct
AI_ENABLED=true
```

// Architectural Pattern
// -------------------------

Use the unified database manager:

```ts
// lib/db.manager.ts
interface DatabaseManager {
  postgres: PostgresManager;
  redis: RedisManager;
  vector: VectorManager;
  document: DocumentManager;
}
```

All reads/writes should go through this orchestrator to allow error handling, caching, and tracking across databases.

// Naming Convention Enforcement
// -------------------------

Check for naming violations with:
```bash
pnpm check:naming
```

This command scans all TypeScript files and reports violations of our naming conventions:
- ✅ **Allowed**: camelCase (userActions.ts), dot.case (user.service.ts, character.schema.ts)
- ❌ **Forbidden**: kebab-case (user-actions.ts), snake_case (user_actions.ts)

The tool automatically excludes build artifacts, node_modules, and other non-source directories.

// Environment Loading for Standalone Scripts
// -------------------------

All standalone Node.js scripts (non-Next.js) must use the shared environment loader from `@story-engine/utils`:

```ts
import { loadEnv, loadEnvForScript } from "@story-engine/utils";

// Basic loading from .env.local
loadEnv();

// Enhanced loading with database URL validation (recommended for scripts)
loadEnvForScript();
```

**Critical Rules:**
- ✅ **Use**: `loadEnv()` or `loadEnvForScript()` from `@story-engine/utils`
- ❌ **Avoid**: Direct `require("dotenv").config()` calls
- Next.js apps automatically load `.env.local` - no manual loading needed
- Standalone scripts require explicit environment loading

**Validation:**
```bash
pnpm check:env-loading            # Validates all scripts use standardized loader
```

This ensures consistent `.env.local` loading across all scripts and prevents configuration drift.
