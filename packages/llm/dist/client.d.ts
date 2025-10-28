import type { CompletionDelta, CompletionFinal, CompleteChatParams, LLMClientInit } from './types';
export declare class LLMClient {
    private adapter;
    private hooks?;
    private telemetry?;
    constructor(init: LLMClientInit);
    capabilities(model: string): Promise<import("./types").ProviderCapabilities>;
    completeChat(params: CompleteChatParams): Promise<{
        stream: AsyncIterable<CompletionDelta>;
        final: Promise<CompletionFinal>;
    }>;
    moderate(_params: {
        text: string;
    }): Promise<{
        action: "allow";
    }>;
    tools(): {
        list: () => never[];
    };
}
//# sourceMappingURL=client.d.ts.map