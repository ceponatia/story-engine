import { OllamaConfig, OllamaResponse, ModelInfo } from "../types/ollama";
export declare class OllamaClient {
    private baseUrl;
    private timeout;
    constructor(config?: OllamaConfig);
    healthCheck(): Promise<boolean>;
    listModels(): Promise<ModelInfo[]>;
    pullModel(name: string, onProgress?: (progress: any) => void): Promise<void>;
    generate(model: string, prompt: string, options?: {
        system?: string;
        temperature?: number;
        top_p?: number;
        top_k?: number;
        repeat_penalty?: number;
        max_tokens?: number;
        stream?: boolean;
        functions?: any[];
    }): Promise<OllamaResponse>;
    chat(model: string, messages: Array<{
        role: string;
        content: string;
    }>, options?: {
        temperature?: number;
        top_p?: number;
        top_k?: number;
        repeat_penalty?: number;
        max_tokens?: number;
        stream?: boolean;
        functions?: any[];
        presence_penalty?: number;
        frequency_penalty?: number;
        stop?: string[];
    }): Promise<OllamaResponse>;
    deleteModel(name: string): Promise<void>;
    copyModel(source: string, destination: string): Promise<void>;
    showModel(name: string): Promise<any>;
    embeddings(model: string, input: string | string[], options?: {
        truncate?: boolean;
        keep_alive?: string;
    }): Promise<{
        embeddings: number[][];
    }>;
}
//# sourceMappingURL=client.d.ts.map