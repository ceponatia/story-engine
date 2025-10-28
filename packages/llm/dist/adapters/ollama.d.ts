import type { ChatMessage, CompletionDelta, CompletionFinal, CompletionOptions, ProviderAdapter, ProviderCapabilities, AbortSignalLike } from '../types';
/**
 * Minimal Ollama adapter targeting local HTTP API.
 * Streaming protocol: text/event-stream with JSON lines containing {message:{content}, done}
 */
export declare class OllamaAdapter implements ProviderAdapter {
    baseUrl: string;
    constructor(opts?: {
        baseUrl?: string;
    });
    capabilities(model: string): Promise<ProviderCapabilities>;
    chat(messages: ChatMessage[], opts: CompletionOptions, signal?: AbortSignalLike): Promise<{
        stream: AsyncIterable<CompletionDelta>;
        final: Promise<CompletionFinal>;
    }>;
}
//# sourceMappingURL=ollama.d.ts.map