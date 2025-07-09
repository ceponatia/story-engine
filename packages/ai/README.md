# @story-engine/ai

AI services package providing LLM integration, embeddings, and prompt management for Story Engine.

## Features

- **LLM Integration**: Ollama client for Mistral AI model communication
- **Embedding Service**: Text embeddings for semantic search and memory
- **RAG Context Enhancement**: Retrieval-augmented generation for better responses
- **Prompt Templates**: Optimized prompts for different adventure scenarios
- **Background Processing**: Async AI tasks and embedding generation
- **Function Calling**: AI functions for character tracking and state extraction

## Components

### Core AI Services
- `ollama/client.ts` - Ollama LLM client with streaming support
- `embedding-service.ts` - Text embedding generation and management
- `similarity-search.ts` - Vector similarity search for context retrieval
- `rag-context-enhancer.ts` - Context enhancement for better AI responses

### AI Functions
- `functions/character-tracker.ts` - Automated character state updates
- `functions/state-extractor.ts` - Extract character state from conversations
- `functions/context-analyzer.ts` - Analyze conversation context

### Prompt Management
- `prompts/templates/` - Adventure-specific prompt templates
- `prompts/optimized-templates.ts` - Performance-optimized prompts
- `prompts/registry.ts` - Centralized prompt management

### Background Processing
- `background-worker.ts` - Async AI task processing
- `prompt-enhancement.ts` - Dynamic prompt improvement

## Usage

```typescript
import { ollamaClient } from '@story-engine/ai/ollama/client';
import { embeddingService } from '@story-engine/ai/embedding-service';
import { promptRegistry } from '@story-engine/ai/prompts/registry';

// Generate AI response
const response = await ollamaClient.generate({
  model: 'mistral:instruct',
  prompt: 'Your adventure prompt here'
});

// Create embeddings
const embedding = await embeddingService.generateEmbedding('text to embed');

// Get optimized prompt
const prompt = promptRegistry.getPrompt('adventure.action', { context: '...' });
```

## Configuration

Requires environment variables:
- `OLLAMA_BASE_URL` - Ollama server URL
- `OLLAMA_MODEL` - AI model to use
- `AI_ENABLED` - Enable/disable AI features