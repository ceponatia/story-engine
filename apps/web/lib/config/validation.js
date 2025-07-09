export function validateAIConfig() {
    const aiEnabled = process.env.AI_ENABLED === "true";
    if (!aiEnabled) {
        console.warn("AI features are disabled. Set AI_ENABLED=true to enable LLM integration.");
    }
    const config = {
        ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
        ollamaModel: process.env.OLLAMA_MODEL || "mistral:instruct",
        aiEnabled,
        timeout: 30000,
        useOptimizedTemplates: process.env.USE_OPTIMIZED_TEMPLATES === "true",
    };
    if (aiEnabled) {
        if (!config.ollamaBaseUrl) {
            throw new Error("OLLAMA_BASE_URL is required when AI_ENABLED=true");
        }
        if (!config.ollamaModel) {
            throw new Error("OLLAMA_MODEL is required when AI_ENABLED=true");
        }
        try {
            new URL(config.ollamaBaseUrl);
        }
        catch (_a) {
            throw new Error(`Invalid OLLAMA_BASE_URL format: ${config.ollamaBaseUrl}`);
        }
    }
    return config;
}
export function getAIConfig() {
    try {
        return validateAIConfig();
    }
    catch (_a) {
        console.error("AI configuration error");
        return {
            ollamaBaseUrl: "http://localhost:11434",
            ollamaModel: "mistral:instruct",
            aiEnabled: false,
            timeout: 30000,
            useOptimizedTemplates: false,
        };
    }
}
export function isAIAvailable() {
    const config = getAIConfig();
    return config.aiEnabled;
}
