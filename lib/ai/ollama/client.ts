/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { OllamaConfig, OllamaResponse, ModelInfo } from '../types/ollama';

export class OllamaClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: OllamaConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.timeout = config.timeout || 30000;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.error('Ollama health check failed:', error);
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Failed to list models:', error);
      throw error;
    }
  }

  async pullModel(name: string, onProgress?: (progress: any) => void): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const progress = JSON.parse(line);
            if (onProgress) onProgress(progress);
            if (progress.error) {
              throw new Error(progress.error);
            }
          } catch (parseError) {
            // Ignore parsing errors for non-JSON lines
          }
        }
      }
    } catch (error) {
      console.error('Failed to pull model:', error);
      throw error;
    }
  }

  async generate(
    model: string,
    prompt: string,
    options: {
      system?: string;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      stream?: boolean;
      functions?: any[];
    } = {}
  ): Promise<OllamaResponse> {
    try {
      const requestBody = {
        model,
        prompt,
        system: options.system,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          num_predict: options.max_tokens || -1,
        },
        stream: options.stream || false,
        functions: options.functions,
      };

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to generate response:', error);
      throw error;
    }
  }

  async chat(
    model: string,
    messages: Array<{ role: string; content: string }>,
    options: {
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      stream?: boolean;
      functions?: any[];
    } = {}
  ): Promise<OllamaResponse> {
    try {
      const requestBody = {
        model,
        messages,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          num_predict: options.max_tokens || -1,
        },
        stream: options.stream || false,
        functions: options.functions,
      };

      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to chat:', error);
      throw error;
    }
  }

  async deleteModel(name: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete model:', error);
      throw error;
    }
  }

  async copyModel(source: string, destination: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ source, destination }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to copy model:', error);
      throw error;
    }
  }

  async showModel(name: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/show`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to show model info:', error);
      throw error;
    }
  }
}