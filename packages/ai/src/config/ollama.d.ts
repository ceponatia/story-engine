import { OllamaConfig } from "../types/ollama";
export declare const OLLAMA_CONFIG: OllamaConfig;
export declare const RECOMMENDED_MODELS: {
    readonly "mistral:7b-instruct-v0.1-q4_0": {
        readonly name: "mistral:7b-instruct-v0.1-q4_0";
        readonly description: "Mistral 7B Instruct with 4-bit quantization (recommended)";
        readonly size: "4.1GB";
        readonly vram: "~6GB";
        readonly features: readonly ["function_calling", "instruct", "creative_writing"];
    };
    readonly "mistral:7b-instruct-v0.3-q4_0": {
        readonly name: "mistral:7b-instruct-v0.3-q4_0";
        readonly description: "Mistral 7B Instruct v0.3 with 4-bit quantization";
        readonly size: "4.1GB";
        readonly vram: "~6GB";
        readonly features: readonly ["function_calling", "instruct", "creative_writing"];
    };
    readonly "llama3.2:3b-instruct-q4_0": {
        readonly name: "llama3.2:3b-instruct-q4_0";
        readonly description: "Llama 3.2 3B (lower resource usage)";
        readonly size: "2.0GB";
        readonly vram: "~4GB";
        readonly features: readonly ["instruct", "creative_writing"];
    };
    readonly "qwen2.5:7b-instruct-q4_0": {
        readonly name: "qwen2.5:7b-instruct-q4_0";
        readonly description: "Qwen 2.5 7B Instruct (good multilingual support)";
        readonly size: "4.4GB";
        readonly vram: "~6GB";
        readonly features: readonly ["instruct", "multilingual", "creative_writing"];
    };
};
export declare const DEFAULT_MODEL = "mistral:7b-instruct-v0.1-q4_0";
export declare const GENERATION_PRESETS: {
    readonly creative: {
        readonly temperature: 0.8;
        readonly top_p: 0.9;
        readonly top_k: 40;
        readonly repeat_penalty: 1.1;
    };
    readonly balanced: {
        readonly temperature: 0.7;
        readonly top_p: 0.9;
        readonly top_k: 40;
        readonly repeat_penalty: 1.05;
    };
    readonly precise: {
        readonly temperature: 0.3;
        readonly top_p: 0.7;
        readonly top_k: 20;
        readonly repeat_penalty: 1;
    };
    readonly deterministic: {
        readonly temperature: 0;
        readonly top_p: 1;
        readonly top_k: 1;
        readonly repeat_penalty: 1;
        readonly seed: 42;
    };
};
export declare const SYSTEM_PROMPTS: {
    readonly story_writer: "You are a creative story writer with expertise in character development, world-building, and narrative structure. You help create engaging stories with rich details and compelling characters.";
    readonly character_developer: "You are a character development expert. You help create detailed, believable characters with complex personalities, backgrounds, and motivations that fit within their story world.";
    readonly world_builder: "You are a world-building specialist. You help create immersive fictional worlds with consistent rules, rich histories, and detailed settings that enhance storytelling.";
    readonly dialogue_writer: "You are a dialogue specialist. You write natural, character-appropriate dialogue that advances the plot and reveals character personalities.";
    readonly plot_assistant: "You are a plot development assistant. You help structure narratives, create compelling conflicts, and ensure story pacing and flow.";
};
export declare const CUDA_REQUIREMENTS: {
    minimum_vram: string;
    recommended_vram: string;
    cuda_version: string;
    compute_capability: string;
    driver_version: string;
};
export declare const ROCM_REQUIREMENTS: {
    minimum_vram: string;
    recommended_vram: string;
    rocm_version: string;
    supported_gpus: string[];
};
export declare function getModelRecommendation(availableVRAM: number): string;
export declare function validateCudaSupport(): boolean;
export declare function validateRocmSupport(): boolean;
//# sourceMappingURL=ollama.d.ts.map