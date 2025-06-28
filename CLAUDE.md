# CLAUDE.md

**Story Engine Development Guide for Claude Code**

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with this repository.

@character-architecture.md - description of character implementation and related db schema
@phase3.md - current development targets

## 🚨 Critical Instructions

- **Server Port**: Always assume the development server runs on `:3000`. If not running, ask user to start it
- **Port Checking**: Use `ps aux | grep -i next` to check running processes, NOT `lsof -ti:xxxx`
- **Next Config**: Our config file is `next.config.ts` (TypeScript), not `.js`
- **Database Access**: Always use `getDatabase()` from `@/lib/database/pool` for connections, NOT `connection.ts`
- **User Table**: Use 'user' table for Better Auth support, NOT 'users'

---

## 📋 Project Overview

**Story Engine** is an AI-powered interactive storytelling platform built with Next.js 15, PostgreSQL, and Ollama/Mistral integration. Users create characters, settings, and locations, then engage in AI-driven adventures with persistent character states and memory.

### Core Features
- **Character Management**: Create detailed characters with personalities, backgrounds, and physical attributes
- **World Building**: Design settings and locations for stories
- **AI Adventures**: Interactive conversations with characters powered by Mistral AI
- **State Persistence**: Character states evolve through conversations
- **User Authentication**: Secure login/registration with Better Auth
- **Vector Search**: Semantic search capabilities with PGVector

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **Backend**: PostgreSQL with PGVector, Better Auth, Server Actions
- **AI**: Ollama + Mistral Instruct model
- **Development**: Docker, Jest, ESLint, Turbopack

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Ollama installed locally

### Initial Setup
1. **Database**: `docker-compose up -d`
2. **Dependencies**: `npm install`
3. **AI Model**: `ollama run mistral:instruct`
4. **Development**: `npm run dev` (server starts on :3000)
5. **Test Login**: Use `claude-test@storyengine.com` / `TestPass123!`

---

## 🛠️ Development Commands

### Core Workflow Commands
```bash
# Start development environment
docker-compose up -d              # Database (required first)
ollama run mistral:instruct       # AI model (required for adventures)
npm run dev                       # Development server (:3000)

# Daily development
npm run lint                      # Code linting
npm test                          # Run tests
npm run test:watch               # Tests in watch mode
```

### Database Management
```bash
# Basic database operations
docker-compose up -d                                                    # Start PostgreSQL with PGVector
docker exec storyengine_db psql -U claude -d storyengine               # Access database (password: yurikml2)
docker exec storyengine_db psql -U claude -d storyengine -c "\dt"      # List tables
node scripts/extract-schema.js                                         # Extract schema → /database/schema.sql

# Utility scripts
node scripts/create-test-user.js                    # Create test user
node scripts/check-adventure-tables.js              # Verify adventure schema
node scripts/test-login.js                          # Test authentication
```

### Testing & Quality
```bash
npm test                          # Run all tests
npm run test:watch               # Tests in watch mode  
npm run test:coverage            # Coverage report
npm run lint                     # ESLint checking
npm run build                    # Production build
```

### AI/LLM Management
```bash
ollama run mistral:instruct      # Start Mistral model
ollama list                      # List installed models
ollama pull mistral:instruct     # Update model
```

---

## 🏗️ Architecture Overview

### Database Layer (PostgreSQL + PGVector)
- **Container**: `storyengine_db` on port 5432
- **Credentials**: `claude` / `yurikml2` / `storyengine`
- **Extensions**: PGVector for semantic search (1024-dimensional vectors)
- **Connection**: `DatabasePoolManager` in `lib/database/pool.ts`
- **Queries**: Centralized in `lib/database/queries.ts`
- **Schema**: Auto-extracted to `database/schema.sql`

### Authentication (Better Auth)
- **System**: Better Auth with TEXT-based user IDs
- **Fields**: Custom mapping for snake_case database fields
- **Routes**: `/auth/login`, `/auth/register`
- **Test Account**: `claude-test@storyengine.com` / `TestPass123!`

### Data Models
- **Characters**: Full personality, appearance, background tracking
- **Settings**: World-building environments with plot elements
- **Locations**: Geographic/spatial story settings
- **Adventures**: Story instances linking characters + settings + locations
- **Adventure Characters**: Isolated character state for each adventure
- **Adventure Messages**: Conversation history with speaker tracking

### AI Integration (Ollama + Mistral)
- **Model**: `mistral:instruct` via Ollama (localhost:11434)
- **Client**: `lib/ai/ollama/client.ts`
- **Prompts**: Template system in `lib/prompts/`
- **State Tracking**: Character evolution through `app/actions/character-state.ts`

---

## 📁 Key Directories

```
├── app/                          # Next.js App Router
│   ├── actions/                  # Server actions (DB operations)
│   ├── admin/                    # Admin interface pages
│   ├── adventures/               # Adventure-related pages ([id]/chat, continue, new)
│   ├── api/auth/                 # Better Auth API routes
│   ├── auth/                     # Authentication pages (login, register)
│   ├── characters/               # Character management pages ([id], new)
│   ├── dashboard/                # User dashboard
│   ├── library/                  # Content library ([type])
│   ├── locations/                # Location management pages ([id], new)
│   ├── settings/                 # Settings management pages ([id], new)
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── admin/                    # Admin-specific components
│   ├── adventures/               # Adventure-related components
│   ├── auth/                     # Authentication components
│   ├── characters/               # Character management components
│   ├── common/                   # Shared/common components
│   ├── dashboard/                # Dashboard-specific components
│   ├── layout/                   # Layout components (header, hero)
│   ├── library/                  # Library/content browsing components
│   ├── locations/                # Location management components
│   │   └── unified-location-manager.tsx # ✅ UNIFIED - handles create/view/edit seamlessly
│   ├── navigation/               # Navigation components
│   ├── settings/                 # Settings management components
│   │   └── new-setting-form.tsx  # ⚠️ DUPLICATE - has both v1 and v2
│   └── ui/                       # Radix UI/shadcn components
├── lib/                          # Core utilities
│   ├── actions/                  # Server action implementations
│   ├── ai/                       # AI integration
│   │   ├── config/               # AI configuration
│   │   ├── functions/            # AI function definitions
│   │   ├── models/               # AI model configurations
│   │   ├── ollama/               # Ollama-specific integration
│   │   └── types/                # AI type definitions
│   ├── config/                   # Application configuration
│   ├── database/                 # DB connection, queries, types, schema
│   ├── parsers/                  # Data parsing utilities
│   ├── prompts/                  # AI prompt templates and system
│   └── schemas/                  # Validation schemas
├── database/                     # Schema files and SQL migrations 
│   └── *.sql                     # ⚠️ MULTIPLE SCHEMA FILES - needs consolidation
├── docs/                         # Documentation
│   └── ai/                       # AI-related documentation
├── hooks/                        # React custom hooks
├── public/                       # Static assets
│   ├── avatars/                  # Avatar images
│   └── site-images/              # Site branding images
├── scripts/                      # Utility and setup scripts
├── utilities/                    # ⚠️ POTENTIALLY DUPLICATE - may overlap with lib/
└── __tests__/                    # Test suites (currently minimal)
    └── database/                 # Database-specific tests
```

---

## 🔧 Environment Configuration

### Required Environment Variables
```bash
DATABASE_URL=postgresql://claude:yurikml2@localhost:5432/storyengine
BETTER_AUTH_SECRET=your-32-char-secret
BETTER_AUTH_URL=http://localhost:3000
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:instruct
AI_ENABLED=true
```

### Database Connection
- **Host**: localhost:5432 (Docker container)
- **Database**: storyengine
- **Username**: claude
- **Password**: yurikml2
- **Extensions**: uuid-ossp, vector

---

## 📊 Current Application Status

### ✅ Fully Functional
- **Authentication**: Better Auth login/register/sessions ✅ FIXED (2025-06-26)
- **Database**: PostgreSQL with PGVector, connection pooling, full CRUD
- **Core Entities**: Characters, Settings, Locations with complete forms
- **UI/UX**: Responsive design, dark/light theme, navigation
- **Infrastructure**: Docker database, Ollama integration, test environment

### 🚧 In Development
- **Adventure Chat**: LLM conversation system with state persistence
- **Character Evolution**: Automated state tracking from conversations
- **Vector Search**: Semantic search for characters and content
- **Memory System**: Conversation history and character memory

### 🔍 Known Issues
- **Database Schema**: Multiple schema files need consolidation
- **LLM Prompts**: Verbose templates need optimization for Mistral
- **Adventure State**: Character copying and speaker system automation
- **Message Persistence**: Adventure chat history debugging

---

## 🛠️ Troubleshooting

### Common Issues

**Server Won't Start**
```bash
# Check if port 3000 is in use
ps aux | grep -i next
# Kill if needed, then restart
npm run dev
```

**Database Connection Failed**
```bash
# Ensure Docker container is running
docker ps | grep storyengine_db
docker-compose up -d
# Test connection
docker exec storyengine_db psql -U claude -d storyengine -c "SELECT 1;"
```

**Authentication Issues**
```bash
# Test with known account
node scripts/test-login.js
# Create new test user
node scripts/create-test-user.js
```

**Ollama/AI Not Working**
```bash
# Check Ollama status
ollama list
ollama run mistral:instruct
# Test integration
curl http://localhost:11434/api/generate -d '{"model":"mistral:instruct","prompt":"test"}'
```

### Development Tools
- **Database Admin**: `/admin` page for table inspection
- **Schema Extraction**: `node scripts/extract-schema.js`
- **Test Utilities**: Scripts in `/scripts/` for user creation, login testing
- **Logs**: Check `dev.log` for development session logs

---

## 🚀 Deployment Notes

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Ollama model available
- [ ] Build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Linting clean: `npm run lint`

### Docker Production
```bash
# Database only (production DB separate)
docker-compose -f docker-compose.prod.yml up -d
```

---

## 🔄 Development Workflow

### Feature Development
1. Create feature branch
2. Develop with `npm run dev`
3. Test with `npm test`
4. Lint with `npm run lint`
5. Extract schema if DB changes: `node scripts/extract-schema.js`
6. Test authentication flows if auth changes

### Database Changes
1. Modify schema in code
2. Apply changes to running DB
3. Extract updated schema: `node scripts/extract-schema.js`
4. Commit updated `database/schema.sql`

### AI/LLM Development
1. Test prompts with Ollama directly
2. Update templates in `lib/prompts/`
3. Test integration with adventure chat
4. Optimize for Mistral's response patterns

---

## 📚 Additional Resources

### MCP Tools Available
- **context7**: Search documentation and libraries
- **shadcn**: Install UI components from shadcn/ui library  
- **zen**: Use Gemini and GPT for complex analysis tasks
- **@smithery/cli**: Run MCP providers from Smithery repository

### Key Dependencies
- **Database**: Drizzle ORM, pg (PostgreSQL driver)
- **Auth**: Better Auth with custom field mapping
- **UI**: Radix UI, Tailwind CSS, next-themes
- **Forms**: React Hook Form, Zod validation
- **AI**: Custom Ollama client, prompt templating system
- **Testing**: Jest, Testing Library, @testing-library/react

### Important File References
- Database pool: `lib/database/pool.ts:getDatabase()`
- Auth config: `lib/auth.ts`
- Server actions: `app/actions/*` and `lib/actions/*`
- Type definitions: `lib/database/types.ts`
- UI components: `components/ui/*`

---

*Last updated: 2025-06-26*
*For additional implementation details, see: `system-prompt-notes.md`, `llm-translation-notes.md`*