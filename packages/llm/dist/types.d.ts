export interface Session {
    id: string;
    title: string;
    characterId?: string;
}
export interface Turn {
    id: string;
    sessionId: string;
    role: 'user' | 'assistant';
    content: string;
}
export type ChatRole = 'system' | 'user' | 'assistant' | 'tool';
export interface ChatMessage {
    role: ChatRole;
    content: string;
    name?: string;
}
export interface ToolSchema {
    name: string;
    description?: string;
    parameters?: unknown;
}
export interface ToolCallDelta {
    name: string;
    argumentsJson: string;
}
export interface CompletionDelta {
    type: 'text' | 'tool_call' | 'event';
    text?: string;
    toolCall?: ToolCallDelta;
    event?: 'start' | 'end';
}
export interface Usage {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    costUSD?: number;
}
export type FinishReason = 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'error';
export interface CompletionFinal {
    model: string;
    finishReason: FinishReason;
    usage: Usage;
    toolCalls?: Array<{
        name: string;
        arguments: unknown;
    }>;
    raw?: unknown;
}
export interface CompletionOptions {
    model: string;
    temperature?: number;
    top_p?: number;
    presence_penalty?: number;
    frequency_penalty?: number;
    max_tokens?: number;
    seed?: number;
    json?: boolean;
    tools?: ToolSchema[];
    timeoutMs?: number;
    maxBudgetUSD?: number;
}
export interface PromptAssembleInput {
    session?: Session;
    turn?: Turn;
    system?: string;
    character?: string;
    memory?: string[];
    tools?: ToolSchema[];
    userMessages: ChatMessage[];
}
export interface PromptHooks {
    assemble(input: PromptAssembleInput): ChatMessage[];
    sanitize?(messages: ChatMessage[], opts: CompletionOptions): ChatMessage[];
}
export interface ProviderCapabilities {
    id: string;
    contextWindow?: number;
    tools?: boolean;
    jsonMode?: boolean;
    vision?: boolean;
}
export interface ProviderAdapter {
    capabilities(model: string): Promise<ProviderCapabilities>;
    chat(messages: ChatMessage[], opts: CompletionOptions, signal?: AbortSignalLike): Promise<{
        stream: AsyncIterable<CompletionDelta>;
        final: Promise<CompletionFinal>;
    }>;
}
export interface TelemetryEvents {
    onPreflight?(evt: {
        requestId: string;
        sessionId?: string;
        model: string;
    }): void;
    onCompletion?(evt: {
        requestId: string;
        model: string;
        latencyMs: number;
        usage?: Usage;
        finishReason?: FinishReason;
        retries?: number;
    }): void;
    onError?(evt: {
        requestId: string;
        model?: string;
        error: unknown;
    }): void;
}
export interface LLMClientInit {
    adapter: ProviderAdapter;
    hooks?: PromptHooks;
    telemetry?: TelemetryEvents;
}
export interface CompleteChatParams {
    messages: ChatMessage[];
    options: CompletionOptions;
    sessionId?: string;
    requestId?: string;
    signal?: AbortSignalLike;
}
export type AbortSignalLike = {
    aborted?: boolean;
    addEventListener?: (type: string, listener: (...args: any[]) => void) => void;
    removeEventListener?: (type: string, listener: (...args: any[]) => void) => void;
} | undefined;
//# sourceMappingURL=types.d.ts.map