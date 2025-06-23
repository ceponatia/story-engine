# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tools Available

### MCP

- `context7` - search/find documentation
- `@smithery/cli run "mcp provider/mcp name"` - run an mcp from smithery's repo

## Development Commands

- `npm run dev` - Start development server (uses Turbopack)
- `npm run build` - Build for production 
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `ollama run mistral:instruct` - Start LLM model

## Architecture Overview

This is a Next.js 15 application with Supabase integration for a story/character management system. It integrates with Ollama and Mistral 7B for AI-powered storytelling, utilizing Mistral's function calling capabilities for RAG-style prompt injection experiments. Key architectural patterns:

### Database & Authentication
- **Supabase Integration**: Full-stack integration with authentication, database, and SSR
- **Client Types**: Separate client creation for browser (`lib/supabase/client.ts`) and server (`lib/supabase/server.ts`)
- **Authentication Middleware**: Automatic route protection via middleware (`lib/supabase/middleware.ts`)
- **Protected Routes**: Pages under `/protected` require authentication

### Data Models
- **Characters**: Core entity with fields for name, age, gender, tags, appearance, fragrances, personality, background
- **Settings**: Secondary management entity with similar CRUD patterns
- **Locations**: Secondary management entity with similar CRUD patterns

### Component Structure
- **Feature-based Organization**: Components grouped by domain (auth, characters, library, settings)
- **Shared UI Components**: Radix UI-based components in `components/ui/`
- **Form Patterns**: Consistent edit/view toggle pattern in forms (see `CharacterForm`)

### Key Pages & Routes
- `/` - Home page
- `/auth/*` - Authentication flows (login, signup, password reset)
- `/characters/[id]` - Character detail/edit page
- `/characters/new` - Create new character
- `/library/[type]` - Library browsing by type
- `/settings/*` - Settings management
- `/protected` - Protected area layout

### Styling & UI
- **Tailwind CSS**: Primary styling framework
- **Radix UI**: Headless UI components
- **Theme System**: Dark/light mode via next-themes
- **Responsive Design**: Mobile-first approach

### File Upload & Images
- **Image Handling**: Next.js Image component with placeholder.co integration
- **File Uploads**: Basic file upload for character avatars (local preview)

### AI Integration (Ollama + Mistral 7B)
- **Ollama Client**: Connection management in `lib/ai/ollama/client.ts`
- **Model Configuration**: Mistral 7B with 4-bit quantization for 8GB VRAM compatibility
- **Function Calling**: Custom function definitions in `lib/ai/functions/`
- **RAG Implementation**: Character/setting context injection for story generation
- **Type Safety**: TypeScript definitions in `lib/ai/types/`
- **Configuration**: AI settings and model parameters in `lib/ai/config/`

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OLLAMA_BASE_URL` - Ollama server URL (default: http://localhost:11434)
- `OLLAMA_MODEL` - Model name (default: mistral:7b-instruct-v0.1-q4_0)
- `AI_ENABLED` - Enable/disable AI features (default: false)

## Development Notes
- Uses TypeScript with strict mode enabled
- Path aliases configured: `@/*` maps to project root
- ESLint configuration extends Next.js defaults
- No test framework currently configured