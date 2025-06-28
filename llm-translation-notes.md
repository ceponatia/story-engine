# LLM Translation Middleware - Design Document

## Executive Summary

This document outlines a **translation middleware strategy** for the Story Engine application to enable seamless switching between LLM providers (Ollama, OpenAI, Mistral, Anthropic) while preserving existing code architecture and requiring zero frontend changes.

## Current Architecture Analysis

### Strengths
- ✅ Clean separation between client (`OllamaClient`), configuration (`lib/config/validation.ts`), and business logic (`app/actions/llm.ts`)
- ✅ Proper authentication and user access control via `requireAuth()`
- ✅ Sophisticated response validation system with adventure-type-specific configurations
- ✅ Type-safe interfaces throughout the application
- ✅ Environment-based configuration with validation and fallback mechanisms
- ✅ Comprehensive error handling and health checks

### Current Limitations for Cloud Migration
- 🔴 **High Impact**: Tight coupling to Ollama's API structure (`/api/chat`, `/api/generate`)
- 🟡 **Medium Impact**: Provider-specific environment variables (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`)
- 🟡 **Medium Impact**: No abstraction layer for different LLM providers
- 🟡 **Medium Impact**: Message role mapping assumptions
- 🟡 **Medium Impact**: Response parsing assumes Ollama's specific response structure

### Key Files Analyzed
- `lib/ai/ollama/client.ts` - HTTP client with Ollama-specific endpoints
- `app/actions/llm.ts` - Server action orchestrating LLM interactions
- `lib/config/validation.ts` - Environment-based configuration management
- `lib/config/response-validation.ts` - Provider-agnostic response validation
- `lib/ai/types/ollama.ts` - Type definitions for Ollama API

## Recommended Solution: Translation Middleware

### Architecture Overview
```
Frontend/Actions → OllamaClient → Translation Middleware → Cloud Provider APIs
```

### Core Benefits
1. **Zero Frontend Changes** - Existing business logic remains untouched
2. **Provider Agnostic** - Switch providers via environment variables only
3. **Incremental Migration** - Add providers one by one without breaking changes
4. **Preservation of Investments** - Response validation, auth, and business logic reused

## Implementation Strategy

### Phase 1: Create Translation Layer

#### 1.1 Provider Translator Class
Create `lib/ai/middleware/provider-translator.ts`:

```typescript
interface LLMRequest {
  model: string;
  messages: Array<{role: string; content: string}>;
  options: {
    temperature?: number;
    top_p?: number;
    max_tokens?: number;
    stream?: boolean;
  };
}

interface LLMResponse {
  model: string;
  message: {role: string; content: string};
  done: boolean;
  total_duration?: number;
  eval_count?: number;
  // Normalized response format matching Ollama structure
}

class ProviderTranslator {
  translateRequest(provider: string, ollamaRequest: LLMRequest) {
    switch(provider) {
      case 'openai':
        return this.toOpenAIFormat(ollamaRequest);
      case 'anthropic':
        return this.toAnthropicFormat(ollamaRequest);
      case 'mistral':
        return this.toMistralFormat(ollamaRequest);
      case 'ollama':
      default:
        return ollamaRequest; // Pass-through for Ollama
    }
  }
  
  translateResponse(provider: string, providerResponse: any): LLMResponse {
    switch(provider) {
      case 'openai':
        return this.normalizeOpenAIResponse(providerResponse);
      case 'anthropic':
        return this.normalizeAnthropicResponse(providerResponse);
      case 'mistral':
        return this.normalizeMistralResponse(providerResponse);
      case 'ollama':
      default:
        return providerResponse; // Already in correct format
    }
  }

  private toOpenAIFormat(ollamaRequest: LLMRequest) {
    return {
      model: ollamaRequest.model,
      messages: ollamaRequest.messages, // Already compatible!
      temperature: ollamaRequest.options.temperature || 0.7,
      max_tokens: ollamaRequest.options.max_tokens || -1,
      top_p: ollamaRequest.options.top_p || 0.9,
      stream: ollamaRequest.options.stream || false
    };
  }

  private normalizeOpenAIResponse(openaiResponse: any): LLMResponse {
    return {
      model: openaiResponse.model,
      message: {
        role: openaiResponse.choices[0].message.role,
        content: openaiResponse.choices[0].message.content
      },
      done: true,
      total_duration: null, // OpenAI doesn't provide this
      eval_count: openaiResponse.usage?.completion_tokens || null
    };
  }
}
```

#### 1.2 Update Configuration System
Extend `lib/config/validation.ts`:

```typescript
export interface AIConfig {
  provider: 'ollama' | 'openai' | 'anthropic' | 'mistral';
  baseUrl: string;
  model: string;
  apiKey?: string; // Required for cloud providers
  aiEnabled: boolean;
  timeout: number;
}

export function validateAIConfig(): AIConfig {
  const provider = (process.env.LLM_PROVIDER || 'ollama') as AIConfig['provider'];
  const aiEnabled = process.env.AI_ENABLED === 'true';
  
  const config: AIConfig = {
    provider,
    baseUrl: process.env.LLM_BASE_URL || getDefaultBaseUrl(provider),
    model: process.env.LLM_MODEL || getDefaultModel(provider),
    apiKey: process.env.LLM_API_KEY,
    aiEnabled,
    timeout: 30000,
  };

  // Validate cloud provider requirements
  if (provider !== 'ollama' && !config.apiKey) {
    throw new Error(`LLM_API_KEY is required for provider: ${provider}`);
  }

  return config;
}

function getDefaultBaseUrl(provider: string): string {
  switch(provider) {
    case 'openai': return 'https://api.openai.com/v1';
    case 'anthropic': return 'https://api.anthropic.com';
    case 'mistral': return 'https://api.mistral.ai/v1';
    case 'ollama':
    default: return 'http://localhost:11434';
  }
}

function getDefaultModel(provider: string): string {
  switch(provider) {
    case 'openai': return 'gpt-4o';
    case 'anthropic': return 'claude-3-5-sonnet-20241022';
    case 'mistral': return 'mistral-large-latest';
    case 'ollama':
    default: return 'mistral:instruct';
  }
}
```

#### 1.3 Update OllamaClient
Modify `lib/ai/ollama/client.ts`:

```typescript
import { ProviderTranslator } from '../middleware/provider-translator';

export class OllamaClient {
  private baseUrl: string;
  private timeout: number;
  private provider: string;
  private apiKey?: string;
  private translator = new ProviderTranslator();

  constructor(config: OllamaConfig = {}) {
    this.provider = config.provider || process.env.LLM_PROVIDER || 'ollama';
    this.baseUrl = config.baseUrl || process.env.LLM_BASE_URL || this.getDefaultBaseUrl();
    this.apiKey = config.apiKey || process.env.LLM_API_KEY;
    this.timeout = config.timeout || 30000;
  }

  async chat(model: string, messages: any[], options: any = {}): Promise<OllamaResponse> {
    try {
      // Translate request for target provider
      const translatedRequest = this.translator.translateRequest(this.provider, {
        model, messages, options
      });
      
      // Get provider-specific endpoint and headers
      const endpoint = this.getProviderEndpoint();
      const headers = this.getProviderHeaders();
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(translatedRequest),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Translate response back to Ollama format
      return this.translator.translateResponse(this.provider, data);
    } catch (error) {
      console.error(`Failed to chat with ${this.provider}:`, error);
      throw error;
    }
  }

  private getProviderEndpoint(): string {
    switch(this.provider) {
      case 'openai':
        return `${this.baseUrl}/chat/completions`;
      case 'anthropic':
        return `${this.baseUrl}/messages`;
      case 'mistral':
        return `${this.baseUrl}/chat/completions`;
      case 'ollama':
      default:
        return `${this.baseUrl}/api/chat`;
    }
  }

  private getProviderHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch(this.provider) {
      case 'openai':
        if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
        break;
      case 'anthropic':
        if (this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
          headers['anthropic-version'] = '2023-06-01';
        }
        break;
      case 'mistral':
        if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;
        break;
      // Ollama doesn't require auth headers
    }

    return headers;
  }
}
```

### Phase 2: Provider-Specific Implementations

#### 2.1 OpenAI Integration
- Messages format already compatible (`{role, content}`)
- Map response structure to Ollama format
- Handle usage statistics and timing differences

#### 2.2 Mistral Cloud Integration
- Similar to OpenAI API structure
- Support for Mistral-specific parameters
- Cost optimization considerations

#### 2.3 Anthropic Integration
- Convert messages to Anthropic's format
- Handle system messages differently
- Map Claude's response structure

### Phase 3: Advanced Features

#### 3.1 Provider Fallback System
```typescript
class LLMClientWithFallback extends OllamaClient {
  private fallbackProviders: string[];
  
  async chat(model: string, messages: any[], options: any = {}) {
    for (const provider of [this.provider, ...this.fallbackProviders]) {
      try {
        return await super.chat(model, messages, options);
      } catch (error) {
        console.warn(`Provider ${provider} failed, trying next...`);
        this.switchProvider(provider);
      }
    }
    throw new Error('All providers failed');
  }
}
```

#### 3.2 Cost Optimization
- Route requests based on cost per token
- Implement usage tracking
- Smart model selection based on request complexity

## Environment Configuration

### Current Environment Variables (Backward Compatible)
```bash
# Existing Ollama setup (continues working)
AI_ENABLED=true
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:instruct
```

### New Generic Configuration
```bash
# Generic LLM configuration
AI_ENABLED=true
LLM_PROVIDER=ollama  # ollama | openai | anthropic | mistral
LLM_BASE_URL=http://localhost:11434
LLM_MODEL=mistral:instruct
LLM_API_KEY=  # Required for cloud providers

# Provider switching examples:
# OpenAI
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o

# Mistral Cloud
LLM_PROVIDER=mistral
LLM_API_KEY=...
LLM_BASE_URL=https://api.mistral.ai/v1
LLM_MODEL=mistral-large-latest
```

## Migration Path

### Step 1: Implement Translation Layer (No Breaking Changes)
- Create `ProviderTranslator` class
- Update configuration system with backward compatibility
- Modify `OllamaClient` to use translation middleware
- Keep Ollama as default provider

### Step 2: Add Cloud Providers
- Implement OpenAI translation
- Add Mistral Cloud support
- Test with existing frontend and business logic
- Validate response compatibility

### Step 3: Production Deployment
- Environment-based provider switching
- Monitoring and logging for different providers
- Performance benchmarking
- Cost analysis

## Benefits Summary

### Technical Benefits
- **Zero Breaking Changes**: Existing code continues working unchanged
- **Provider Flexibility**: Switch providers via environment variables only
- **Preserved Investments**: Response validation, authentication, business logic reused
- **Incremental Migration**: Add providers gradually without risk

### Business Benefits
- **Vendor Independence**: Not locked into any single LLM provider
- **Cost Optimization**: Choose providers based on cost/performance needs
- **Reliability**: Fallback providers for high availability
- **Future-Proof**: Easy to add new providers as they emerge

## Risk Mitigation

### Technical Risks
- **API Compatibility**: Different providers may have subtle differences
  - *Mitigation*: Comprehensive testing with translation layer
- **Response Format Changes**: Providers may update their APIs
  - *Mitigation*: Version-specific translation handlers

### Operational Risks
- **Cost Management**: Cloud providers charge per token
  - *Mitigation*: Usage monitoring and rate limiting
- **Latency Differences**: Cloud providers may be slower than local Ollama
  - *Mitigation*: Performance benchmarking and provider selection

## Next Steps

1. **Create translation middleware classes** (`lib/ai/middleware/`)
2. **Update configuration system** with generic environment variables
3. **Modify OllamaClient** to use translation layer
4. **Test with OpenAI** as first cloud provider
5. **Add Mistral Cloud** support
6. **Implement fallback mechanisms**
7. **Deploy with monitoring** and cost tracking

---

*This document captures the analysis and recommendations from the LLM integration architecture review conducted on 2025-01-25.*