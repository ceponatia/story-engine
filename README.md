# Story Engine - Turborepo Monorepo

A roleplaying chat application built with Next.js 15 and a multi-database backend, now organized as a Turborepo monorepo.

## Architecture

```
/apps/
│
├── web/                   # Next.js app (frontend & backend logic)
│   └── package.json
│
/packages/
│
├── postgres/              # PostgreSQL logic (repos, pool, types, etc.)
├── mongodb/               # MongoDB schema, repo, validation, types
├── qdrant/                # Embedding/vector search layer
├── redis/                 # Session/cache logic
├── characters/            # Character domain (schema, updaters, etc.)
├── adventures/            # Adventure system
├── validation/            # Shared Zod validators
├── types/                 # Global types
```

## Tech Stack

- **Frontend**: React 19 + TypeScript, Tailwind, Radix UI
- **Backend**: PostgreSQL (users/auth), Redis (sessions/cache), MongoDB (objects), Qdrant (semantic memory)
- **AI**: Ollama + mistral:instruct
- **Monorepo**: Turborepo with workspaces
- **Dev Stack**: Docker, Jest, ESLint

## Quick Start

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Build all packages
npm run build

# Run type checking
npm run type-check

# Run tests
npm run test

# Lint code
npm run lint
```

## Development Setup

```bash
# Start databases
docker-compose up -d

# Start AI
ollama run mistral:instruct

# Start development server
npm run dev
```

## Package Commands

Run commands across all packages:
```bash
npm run build         # Build all packages
npm run dev           # Start development mode
npm run type-check    # Type check all packages
npm run lint          # Lint all packages
npm run test          # Test all packages
```

Run commands for specific packages:
```bash
npx turbo build --filter=@story-engine/web
npx turbo dev --filter=@story-engine/postgres
```

## Database Health Checks

```bash
# Check all containers
docker-compose ps

# Redis
docker exec storyengine_redis redis-cli ping

# MongoDB
docker exec storyengine_mongodb mongosh --eval "db.runCommand('ping')"

# Qdrant
curl http://localhost:6333/health

# PostgreSQL
docker exec storyengine_db psql -U claude -d storyengine
```

## Environment Configuration

Copy `.env.example` to `.env` and configure:

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

## Package Dependencies

The monorepo follows a layered architecture:

- **Database packages** (`postgres`, `mongodb`, `redis`, `qdrant`) - Independent database abstractions
- **Domain packages** (`characters`, `adventures`) - Business logic depending on database packages  
- **Shared packages** (`types`, `validation`) - Common utilities used across the monorepo
- **Web app** - Frontend and API routes consuming all packages

This structure enables:
- ✅ Clear separation of concerns
- ✅ Reusable database abstractions
- ✅ Type safety across packages
- ✅ Independent testing and building
- ✅ Efficient caching with Turborepo