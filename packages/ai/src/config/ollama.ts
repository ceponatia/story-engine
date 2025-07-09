import { OllamaConfig } from "../types/ollama";

export const OLLAMA_CONFIG: OllamaConfig = {
  baseUrl: process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || "http://localhost:11434",
  timeout: 60000, // 60 seconds
};

export const RECOMMENDED_MODELS = {
  // Mistral models optimized for story generation
  "mistral:7b-instruct-v0.1-q4_0": {
    name: "mistral:7b-instruct-v0.1-q4_0",
    description: "Mistral 7B Instruct with 4-bit quantization (recommended)",
    size: "4.1GB",
    vram: "~6GB",
    features: ["function_calling", "instruct", "creative_writing"],
  },
  "mistral:7b-instruct-v0.3-q4_0": {
    name: "mistral:7b-instruct-v0.3-q4_0",
    description: "Mistral 7B Instruct v0.3 with 4-bit quantization",
    size: "4.1GB",
    vram: "~6GB",
    features: ["function_calling", "instruct", "creative_writing"],
  },

  // Alternative models for different use cases
  "llama3.2:3b-instruct-q4_0": {
    name: "llama3.2:3b-instruct-q4_0",
    description: "Llama 3.2 3B (lower resource usage)",
    size: "2.0GB",
    vram: "~4GB",
    features: ["instruct", "creative_writing"],
  },
  "qwen2.5:7b-instruct-q4_0": {
    name: "qwen2.5:7b-instruct-q4_0",
    description: "Qwen 2.5 7B Instruct (good multilingual support)",
    size: "4.4GB",
    vram: "~6GB",
    features: ["instruct", "multilingual", "creative_writing"],
  },
} as const;

export const DEFAULT_MODEL = "mistral:7b-instruct-v0.1-q4_0";

export const GENERATION_PRESETS = {
  creative: {
    temperature: 0.8,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.1,
  },
  balanced: {
    temperature: 0.7,
    top_p: 0.9,
    top_k: 40,
    repeat_penalty: 1.05,
  },
  precise: {
    temperature: 0.3,
    top_p: 0.7,
    top_k: 20,
    repeat_penalty: 1.0,
  },
  deterministic: {
    temperature: 0.0,
    top_p: 1.0,
    top_k: 1,
    repeat_penalty: 1.0,
    seed: 42,
  },
} as const;

export const SYSTEM_PROMPTS = {
  story_writer: `You are a creative story writer with expertise in character development, world-building, and narrative structure. You help create engaging stories with rich details and compelling characters.`,

  character_developer: `You are a character development expert. You help create detailed, believable characters with complex personalities, backgrounds, and motivations that fit within their story world.`,

  world_builder: `You are a world-building specialist. You help create immersive fictional worlds with consistent rules, rich histories, and detailed settings that enhance storytelling.`,

  dialogue_writer: `You are a dialogue specialist. You write natural, character-appropriate dialogue that advances the plot and reveals character personalities.`,

  plot_assistant: `You are a plot development assistant. You help structure narratives, create compelling conflicts, and ensure story pacing and flow.`,
} as const;

export const CUDA_REQUIREMENTS = {
  minimum_vram: "6GB",
  recommended_vram: "8GB",
  cuda_version: "11.8+",
  compute_capability: "6.0+",
  driver_version: "520.61+",
};

export const ROCM_REQUIREMENTS = {
  minimum_vram: "6GB",
  recommended_vram: "8GB",
  rocm_version: "5.4+",
  supported_gpus: ["gfx900", "gfx906", "gfx908", "gfx90a", "gfx1030", "gfx1100", "gfx1101"],
};

export function getModelRecommendation(availableVRAM: number): string {
  if (availableVRAM >= 8) {
    return DEFAULT_MODEL;
  } else if (availableVRAM >= 4) {
    return "llama3.2:3b-instruct-q4_0";
  } else {
    throw new Error("Insufficient VRAM. Minimum 4GB required for quantized models.");
  }
}

export function validateCudaSupport(): boolean {
  return Boolean(
    process.env.CUDA_VISIBLE_DEVICES !== "-1" &&
      typeof process.env.CUDA_VISIBLE_DEVICES !== "undefined"
  );
}

export function validateRocmSupport(): boolean {
  return Boolean(
    process.env.ROCR_VISIBLE_DEVICES !== "-1" &&
      typeof process.env.ROCR_VISIBLE_DEVICES !== "undefined"
  );
}
