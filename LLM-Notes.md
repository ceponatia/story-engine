# LLM Integration Notes

## Implementation Status ✅

### Completed Components
- **Ollama Installation**: Successfully installed in `lib/ai/ollama/` with CUDA support
- **Model**: Mistral 7B Instruct (`mistral:instruct`) - 4.1GB, working and tested
- **TypeScript Integration**: Complete client, setup utilities, and type definitions
- **Configuration**: GPU acceleration configured and validated

### Working Directory Structure
```
lib/ai/ollama/
├── install.sh              # Automated installation script  
├── setup-system.sh         # System-wide Ollama setup
├── client.ts               # TypeScript Ollama client
├── setup.ts                # Setup and validation utilities
├── test-integration.ts     # Integration testing script
├── README.md               # Comprehensive documentation
├── bin/                    # Ollama binary location
├── models/                 # Model storage directory
└── logs/                   # Log files directory
```

## Adventure Chat System Design Requirements

### User Requirements Summary
Based on our conversation, here are the confirmed requirements:

1. **Message History**: Last 10 messages sent to LLM
2. **Dynamic Context Summarization**: Yes, implemented via RAG system with JSONB
3. **Context Limits**: Handle via RAG system with JSONB storage
4. **Character Stats/Inventory**: Must affect LLM responses via RAG system
5. **Character Development**: Yes, with progression tracking
6. **Character Personality**: Core to system - LLM primarily acts AS the character
7. **Adventure Branching**: No "what if" support initially (future feature)
8. **Save/Load States**: Not initially (future feature)
9. **Adventure Outcomes**: No set endings initially (future feature)
10. **Multiplayer**: No
11. **Content Moderation**: No initially

### Core Architecture Decision: Copy System

**Critical Requirement**: Characters, settings, and locations must be COPIED from their vanilla state and attached to specific adventures. Only copies are updated during adventures, originals remain untouched.

- Library page edits affect originals only
- Adventure changes affect copies only  
- Once copied to adventure, changes to library originals don't affect adventure copies

## Database Schema Design

### Proposed Core Tables
```sql
-- Adventures table
create table adventures (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  character_id uuid references characters(id) not null,
  location_id uuid references locations(id),
  setting_description text, -- Can reference location but also custom details
  status text not null check (status in ('active', 'paused', 'completed')) default 'active',
  system_prompt text, -- Adventure-specific context for LLM
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);

-- Chat messages table
create table adventure_messages (
  id uuid default gen_random_uuid() primary key,
  adventure_id uuid references adventures(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb, -- For storing LLM response metadata
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) not null
);
```

### Chat Interface Components (shadcn)
- **ScrollArea**: For chat history with auto-scroll
- **Card/CardContent**: Message bubbles and layout
- **Textarea**: User input with Enter key handling
- **Button**: Send button with loading states
- **Avatar**: Character and AI avatars
- **Skeleton**: Typing indicators

## Architecture Decisions (Resolved)

### 1. **Adventure Instance Data Structure** ✅
**Decision**: Use separate tables for adventure instances
- Create `adventure_characters`, `adventure_locations`, and `adventure_settings` tables
- Each table copies all fields from originals plus adds `state_updates` JSONB field for RAG
- Adventures table links to these copied entities and chat history

**Schema Example**:
```sql
create table adventure_characters (
  id uuid default gen_random_uuid() primary key,
  adventure_id uuid references adventures(id) on delete cascade,
  original_character_id uuid references characters(id),
  -- All character fields copied here
  state_updates jsonb default '{}', -- RAG updates
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### 2. **RAG System Architecture** ✅
**Decision**: Store updates in instance objects with structured JSONB
- Updates stored in `state_updates` field of instance tables
- Use diff-based updates with timestamps
- Track when changes occurred for recency

**JSONB Structure**:
```json
{
  "fragrances": {
    "feet": ["smelly", "vinegar", "cheesy"],
    "hair": ["floral", "jasmine"]
  },
  "state": {
    "position": "sitting on wooden chair",
    "location": "tavern_main_room",
    "clothing": {
      "shirt": "blue tunic",
      "changes_from_original": true
    }
  },
  "relationships": {
    "met_characters": ["npc_bartender_id"],
    "reputation": {"tavern": "friendly"}
  }
}
```

### 3. **Copy Timing & Scope** ✅
**Decision**: Copy all entities at adventure start
- Copies created when adventure is first started
- All referenced entities copied in one transaction
- Items/equipment to be added in future (potential separate table)

### 4. **LLM Character Agency** ✅
**Decision**: LLM responds AS the character
- User inputs intentions/actions
- LLM responds in character voice and can take autonomous actions
- User only plays themselves, never NPCs
- Distinguish character thoughts/actions from world responses (implementation TBD)

### 5. **Context Injection Strategy** ✅
**Decision**: Three-tier context injection with lorebook
```typescript
interface LLMContext {
  // Tier 1: Current state (always included)
  character: {
    name: string,
    current_position: string, // Granular: "sitting on bed"
    current_location: string,
    recent_actions: string[]
  },
  
  // Tier 2: Relevant details (context-based)
  relevant_attributes: {}, // Dynamically selected
  
  // Tier 3: Lorebook (accumulated knowledge)
  lorebook: {
    discovered_locations: string[],
    learned_information: Record<string, string>
  }
}
```

### 6. **Change Detection & Updates** ✅
**Decision**: Hybrid approach with function calling + NLP parsing
- Every LLM response calls basic state functions
- Natural language parsing for additional fields (scent, taste, etc.)
- Use Mistral's function calling for structured updates

**Event Sourcing with Validation**:
```sql
create table adventure_state_events (
  id uuid primary key,
  adventure_character_id uuid references adventure_characters(id),
  event_type text,
  event_data jsonb,
  validated boolean default false,
  created_at timestamptz default now()
);
```

### 7. **Data Consistency** ✅
**Decision**: Event sourcing with validation rules
- No teleportation or unrealistic changes
- State must be logical and consistent
- Adventures are hermetic (isolated containers)
- No undo/rollback functionality
- NPCs not tracked initially (future feature)

## Chat Flow Design

### State Management Pattern
```tsx
function AdventureChat({ adventureId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Prevent multiple LLM requests
  // Keep focus on input after sending
  // Auto-scroll to newest messages
  // Handle Enter key for sending
}
```

### Key UX Requirements
- User cannot send multiple messages before LLM responds
- Focus stays on input field after sending message
- Messages sorted vertically with newest at bottom
- Chat history portion shows user and LLM messages
- Send button and Enter key both trigger message sending

## Implementation Plan - Basic Chat Functionality

### Phase 1: Core Infrastructure (Start Here)
1. **Database Setup**
   - Create `adventures` table
   - Create `adventure_messages` table
   - Create basic `adventure_characters` table (simplified copy)
   - Add RLS policies for user data isolation

2. **Basic Adventure Creation Flow**
   - New page: `/adventures/new`
   - Form to select character and optionally location/setting
   - On submit: Copy character data to `adventure_characters`
   - Redirect to chat interface

3. **Chat Interface MVP**
   - New page: `/adventures/[id]/chat`
   - Basic message display (ScrollArea + Cards)
   - Input field with Enter key handling
   - Send button with loading state
   - Simple LLM integration (no RAG yet)

### Phase 2: LLM Integration
1. **Basic Ollama Connection**
   - Server action for sending messages
   - Simple prompt template: "You are {character.name}. {character.personality}"
   - Stream response back to UI
   - Save messages to database

2. **Message History**
   - Load last 10 messages on page load
   - Include in LLM context
   - Auto-scroll to bottom

### Phase 3: State Tracking (Later)
1. Add `state_updates` JSONB field
2. Implement function calling
3. Add validation rules
4. Create lorebook system

### Immediate Next Steps
1. Create database migrations
2. Build adventure creation page
3. Implement basic chat UI
4. Test Ollama integration

## References
- **CLAUDE.md**: Contains development commands, architecture overview, and AI integration details
- **lib/ai/ollama/**: Complete Ollama integration with CUDA support
- **Existing codebase**: Next.js 15 + Supabase + shadcn/ui components