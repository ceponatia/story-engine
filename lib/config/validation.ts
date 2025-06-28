// Environment variable validation and defaults

export interface AIConfig {
  ollamaBaseUrl: string;
  ollamaModel: string;
  aiEnabled: boolean;
  timeout: number;
  useOptimizedTemplates: boolean;
}

export function validateAIConfig(): AIConfig {
  // Check if AI is enabled
  const aiEnabled = process.env.AI_ENABLED === 'true';
  
  if (!aiEnabled) {
    console.warn('AI features are disabled. Set AI_ENABLED=true to enable LLM integration.');
  }

  // Default configuration
  const config: AIConfig = {
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    ollamaModel: process.env.OLLAMA_MODEL || 'mistral:instruct',
    aiEnabled,
    timeout: 30000,
    useOptimizedTemplates: process.env.USE_OPTIMIZED_TEMPLATES === 'true',
  };

  // Validate Ollama configuration if AI is enabled
  if (aiEnabled) {
    if (!config.ollamaBaseUrl) {
      throw new Error('OLLAMA_BASE_URL is required when AI_ENABLED=true');
    }

    if (!config.ollamaModel) {
      throw new Error('OLLAMA_MODEL is required when AI_ENABLED=true');
    }

    // Validate URL format
    try {
      new URL(config.ollamaBaseUrl);
    } catch {
      throw new Error(`Invalid OLLAMA_BASE_URL format: ${config.ollamaBaseUrl}`);
    }
  }

  return config;
}

export function getAIConfig(): AIConfig {
  try {
    return validateAIConfig();
  } catch {
    console.error('AI configuration error');
    // Return disabled config as fallback
    return {
      ollamaBaseUrl: 'http://localhost:11434',
      ollamaModel: 'mistral:instruct',
      aiEnabled: false,
      timeout: 30000,
      useOptimizedTemplates: false,
    };
  }
}

export function isAIAvailable(): boolean {
  const config = getAIConfig();
  return config.aiEnabled;
}