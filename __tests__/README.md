# Adventure Chat Test Suite

This directory contains comprehensive tests for the Adventure Chat implementation (Phase 1 & 2) covering database operations, components, server actions, and LLM integration.

## Test Structure

```
__tests__/
├── actions/               # Server action tests
│   └── adventures.test.ts # createAdventure & sendMessage actions
├── components/            # React component tests
│   ├── adventure-chat.test.tsx
│   └── new-adventure-form.test.tsx
├── database/              # Database integration tests
│   └── adventures.test.ts # RLS, data integrity, relationships
├── integration/           # End-to-end integration tests
│   └── llm-chat.test.ts   # Full LLM chat flow
└── README.md             # This file
```

## Test Categories

### Database Tests (`database/adventures.test.ts`)
Tests the core database functionality including:
- Adventure creation and RLS (Row Level Security)
- Adventure character data copying and schema validation
- Message storage and ordering
- Data relationships and foreign key constraints
- Input validation and error handling

**Key Features Tested:**
- User isolation via RLS policies
- Character data mapping from `characters` to `adventure_characters`
- Message role validation (`user`, `assistant`, `system`)
- Chronological message ordering
- Adventure-character relationships

### Component Tests (`components/`)

#### NewAdventureForm Tests
- Form rendering and field validation
- Character and location selection dropdowns
- Form submission handling
- Loading states and error display
- Character age display logic
- Optional location handling

#### AdventureChat Tests
- Message display and formatting
- Real-time message sending
- Keyboard shortcuts (Enter to send, Shift+Enter for newlines)
- Loading states and error handling
- Input validation and button states
- Message timestamp formatting

### Server Action Tests (`actions/adventures.test.ts`)
Tests the Next.js server actions:
- `createAdventure` - Adventure creation with character data mapping
- `sendMessage` - User message storage and validation
- Authentication and authorization
- Input validation and error handling
- Database transaction handling

### Integration Tests (`integration/llm-chat.test.ts`)
Tests the complete LLM chat flow:
- Full message exchange (user → LLM → database)
- Message history context building
- Character context integration
- Error handling (AI disabled, Ollama unavailable, etc.)
- Metadata storage and retrieval
- Connection health checks

## Setup and Configuration

### Prerequisites
1. **Environment Variables** (required for database tests):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. **Test Database**: Tests use the same Supabase instance but with isolated test data using UUIDs

3. **Dependencies**: All testing dependencies are configured in `package.json`

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test database
npm test components
npm test integration
```

## Test Patterns and Best Practices

### Data Isolation
- Each test suite uses unique UUIDs for test data
- Comprehensive cleanup in `afterAll` hooks
- Tests don't interfere with each other or production data

### Mocking Strategy
- **Server Actions**: Mock Next.js navigation functions (`redirect`, `revalidatePath`)
- **LLM Integration**: Mock Ollama client and AI configuration
- **Database**: Use real Supabase connections with test data isolation
- **Components**: Mock server actions called from components

### Authentication Testing
- Create temporary test users for each test suite
- Proper sign-in/sign-out handling
- Service role key for admin operations (cleanup)

### Error Testing
- Comprehensive error scenarios for each major function
- Network failures, authentication errors, validation errors
- AI service unavailability and configuration issues

## Key Testing Scenarios

### Phase 1 (Adventure Creation)
✅ Adventure form validation and submission  
✅ Character selection and data copying  
✅ Location selection (optional)  
✅ Database RLS enforcement  
✅ Character data schema mapping  

### Phase 2 (Chat Interface)
✅ Message sending and receiving  
✅ LLM integration and response generation  
✅ Message history and context building  
✅ Real-time UI updates  
✅ Error handling and loading states  

### Database Schema Validation
✅ Required field validation  
✅ Enum type validation (message roles)  
✅ Foreign key relationships  
✅ RLS policy enforcement  
✅ Data type conversions (text to JSONB, arrays)  

### LLM Integration
✅ Ollama client health checks  
✅ Message context building (system + history + current)  
✅ Response metadata storage  
✅ Error handling (service unavailable, empty responses)  
✅ Character context enhancement  

## Mock Data Examples

The tests use realistic mock data that matches the application schema:

```typescript
// Character data
const mockCharacters = [
  {
    id: 'char-1',
    name: 'Alice',
    age: 25,
    gender: 'female',
    personality: 'Brave and kind-hearted',
    background: 'A noble knight',
    // ... other fields
  }
]

// Adventure messages
const mockMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Hello, I want to start exploring!',
    created_at: '2024-01-01T10:00:00Z',
    // ... other fields
  }
]
```

## Coverage Goals

- **Database Operations**: 100% of CRUD operations and RLS policies
- **Component Interactions**: All user interactions and state changes
- **Server Actions**: All success and error paths
- **LLM Integration**: Complete chat flow including error scenarios

## Debugging Tests

### Common Issues
1. **Environment Variables**: Ensure all Supabase keys are properly set
2. **Database Permissions**: Service role key needed for admin operations
3. **Test Isolation**: Check UUID generation for unique test data
4. **Async Operations**: Ensure proper `await` usage in async tests

### Useful Commands
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file with debugging
npm test -- --testNamePattern="Adventure Creation"

# Run tests with coverage report
npm run test:coverage
```

## Future Test Additions

As new features are added to the adventure chat system, consider testing:
- Lorebook integration
- State tracking and function calling
- Multi-character conversations
- Adventure sharing and permissions
- Real-time collaboration features