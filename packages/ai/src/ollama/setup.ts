/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { OllamaClient } from "./client";
import { DEFAULT_MODEL, RECOMMENDED_MODELS } from "../config/ollama";

export class OllamaSetup {
  private client: OllamaClient;

  constructor() {
    this.client = new OllamaClient();
  }

  async checkStatus(): Promise<{
    isRunning: boolean;
    models: string[];
    hasRecommendedModel: boolean;
  }> {
    try {
      const isRunning = await this.client.healthCheck();
      if (!isRunning) {
        return {
          isRunning: false,
          models: [],
          hasRecommendedModel: false,
        };
      }

      const models = await this.client.listModels();
      const modelNames = models.map((m) => m.name);
      const hasRecommendedModel = modelNames.includes(DEFAULT_MODEL);

      return {
        isRunning: true,
        models: modelNames,
        hasRecommendedModel,
      };
    } catch (error) {
      console.error("Failed to check Ollama status:", error);
      return {
        isRunning: false,
        models: [],
        hasRecommendedModel: false,
      };
    }
  }

  async installRecommendedModel(
    modelName: string = DEFAULT_MODEL,
    onProgress?: (progress: any) => void
  ): Promise<void> {
    console.log(`Installing model: ${modelName}`);

    const modelInfo = RECOMMENDED_MODELS[modelName as keyof typeof RECOMMENDED_MODELS];
    if (modelInfo) {
      console.log(`Model size: ${modelInfo.size}, VRAM requirement: ${modelInfo.vram}`);
    }

    await this.client.pullModel(modelName, onProgress);
    console.log(`Model ${modelName} installed successfully`);
  }

  async validateInstallation(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check if Ollama is running
      const isRunning = await this.client.healthCheck();
      if (!isRunning) {
        issues.push("Ollama server is not running");
        recommendations.push("Start Ollama with: ollama serve");
        return { isValid: false, issues, recommendations };
      }

      // Check available models
      const models = await this.client.listModels();
      if (models.length === 0) {
        issues.push("No models are installed");
        recommendations.push(`Install the recommended model: ollama pull ${DEFAULT_MODEL}`);
      }

      // Check if recommended model is available
      const hasRecommendedModel = models.some((m) => m.name === DEFAULT_MODEL);
      if (!hasRecommendedModel) {
        issues.push(`Recommended model '${DEFAULT_MODEL}' is not installed`);
        recommendations.push(`Install recommended model: ollama pull ${DEFAULT_MODEL}`);
      }

      // Test model generation
      if (hasRecommendedModel) {
        try {
          const response = await this.client.generate(
            DEFAULT_MODEL,
            'Test prompt: Say "Hello, World!"',
            { max_tokens: 10 }
          );

          if (!response.response) {
            issues.push("Model generation test failed");
            recommendations.push("Check Ollama logs for errors");
          }
        } catch (error) {
          issues.push(`Model generation test failed: ${error}`);
          recommendations.push("Verify GPU drivers and CUDA/ROCm installation");
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations,
      };
    } catch (error) {
      issues.push(`Validation failed: ${error}`);
      return { isValid: false, issues, recommendations };
    }
  }

  async getSystemInfo(): Promise<{
    gpu: "nvidia" | "amd" | "none";
    cudaVersion?: string;
    rocmVersion?: string;
    availableVRAM?: string;
  }> {
    // This would typically require system calls
    // For now, we'll check environment variables
    const info: any = { gpu: "none" };

    if (process.env.CUDA_VISIBLE_DEVICES && process.env.CUDA_VISIBLE_DEVICES !== "-1") {
      info.gpu = "nvidia";
      info.cudaVersion = process.env.CUDA_VERSION || "unknown";
    } else if (process.env.ROCR_VISIBLE_DEVICES && process.env.ROCR_VISIBLE_DEVICES !== "-1") {
      info.gpu = "amd";
      info.rocmVersion = process.env.ROCM_VERSION || "unknown";
    }

    return info;
  }

  async generateWelcomeMessage(): Promise<string> {
    try {
      const status = await this.checkStatus();
      const systemInfo = await this.getSystemInfo();

      if (!status.isRunning) {
        return "Ollama is not running. Please start it with: ollama serve";
      }

      if (!status.hasRecommendedModel) {
        return `Ollama is running but missing the recommended model. Install with: ollama pull ${DEFAULT_MODEL}`;
      }

      const response = await this.client.generate(
        DEFAULT_MODEL,
        "You are a creative story writing assistant. Introduce yourself briefly and mention that you're ready to help with character creation and storytelling.",
        { max_tokens: 100, temperature: 0.7 }
      );

      return (
        response.response ||
        "Hello! I'm your AI story writing assistant, ready to help with characters and stories."
      );
    } catch (error) {
      return `Error connecting to Ollama: ${error}`;
    }
  }
}
