export class OllamaClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || process.env.OLLAMA_BASE_URL || "http://localhost:11434";
        this.timeout = config.timeout || 30000;
    }
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, {
                method: "GET",
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        }
        catch (error) {
            console.error("Ollama health check failed:", error);
            return false;
        }
    }
    async listModels() {
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data.models || [];
        }
        catch (error) {
            console.error("Failed to list models:", error);
            throw error;
        }
    }
    async pullModel(name, onProgress) {
        var _a;
        try {
            const response = await fetch(`${this.baseUrl}/api/pull`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const reader = (_a = response.body) === null || _a === void 0 ? void 0 : _a.getReader();
            if (!reader)
                throw new Error("No response body");
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split("\n").filter((line) => line.trim());
                for (const line of lines) {
                    try {
                        const progress = JSON.parse(line);
                        if (onProgress)
                            onProgress(progress);
                        if (progress.error) {
                            throw new Error(progress.error);
                        }
                    }
                    catch (parseError) {
                    }
                }
            }
        }
        catch (error) {
            console.error("Failed to pull model:", error);
            throw error;
        }
    }
    async generate(model, prompt, options = {}) {
        try {
            const requestBody = {
                model,
                prompt,
                system: options.system,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    top_k: options.top_k || 0,
                    repeat_penalty: options.repeat_penalty || 1.0,
                    num_predict: options.max_tokens || -1,
                },
                stream: options.stream || false,
                functions: options.functions,
            };
            const response = await fetch(`${this.baseUrl}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(this.timeout),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error("Failed to generate response:", error);
            throw error;
        }
    }
    async chat(model, messages, options = {}) {
        try {
            const requestBody = {
                model,
                messages,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    top_k: options.top_k || 0,
                    repeat_penalty: options.repeat_penalty || 1.0,
                    num_predict: options.max_tokens || -1,
                    presence_penalty: options.presence_penalty,
                    frequency_penalty: options.frequency_penalty,
                    stop: options.stop,
                },
                stream: options.stream || false,
                functions: options.functions,
            };
            const response = await fetch(`${this.baseUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(this.timeout),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error("Failed to chat:", error);
            throw error;
        }
    }
    async deleteModel(name) {
        try {
            const response = await fetch(`${this.baseUrl}/api/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        catch (error) {
            console.error("Failed to delete model:", error);
            throw error;
        }
    }
    async copyModel(source, destination) {
        try {
            const response = await fetch(`${this.baseUrl}/api/copy`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ source, destination }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        catch (error) {
            console.error("Failed to copy model:", error);
            throw error;
        }
    }
    async showModel(name) {
        try {
            const response = await fetch(`${this.baseUrl}/api/show`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error("Failed to show model info:", error);
            throw error;
        }
    }
    async embeddings(model, input, options = {}) {
        try {
            const inputs = Array.isArray(input) ? input : [input];
            const requestBody = {
                model,
                input: inputs,
                options: {
                    truncate: options.truncate !== false,
                },
                keep_alive: options.keep_alive || "5m",
            };
            const response = await fetch(`${this.baseUrl}/api/embed`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
                signal: AbortSignal.timeout(this.timeout),
            });
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Embedding model '${model}' not found. Try pulling it first with: ollama pull ${model}`);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.embeddings || !Array.isArray(data.embeddings)) {
                throw new Error("Invalid embedding response format");
            }
            return {
                embeddings: data.embeddings,
            };
        }
        catch (error) {
            console.error("Failed to generate embeddings:", error);
            throw error;
        }
    }
}
