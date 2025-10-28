import type {
  ChatMessage,
  CompletionDelta,
  CompletionFinal,
  CompleteChatParams,
  LLMClientInit,
} from './types';

export class LLMClient {
  private adapter: LLMClientInit['adapter'];
  private hooks?: LLMClientInit['hooks'];
  private telemetry?: LLMClientInit['telemetry'];

  constructor(init: LLMClientInit) {
    this.adapter = init.adapter;
    this.hooks = init.hooks;
    this.telemetry = init.telemetry;
  }

  async capabilities(model: string) {
    return this.adapter.capabilities(model);
  }

  completeChat(params: CompleteChatParams): Promise<{
    stream: AsyncIterable<CompletionDelta>;
    final: Promise<CompletionFinal>;
  }> {
    const requestId = params.requestId ?? makeId();
    const model = params.options.model;

    // Assemble + sanitize messages via hooks
    let messages: ChatMessage[] = params.messages;
    if (this.hooks?.assemble) {
      messages = this.hooks.assemble({
        userMessages: messages,
        tools: params.options.tools,
      });
    }
    if (this.hooks?.sanitize) {
      messages = this.hooks.sanitize(messages, params.options);
    }

    this.telemetry?.onPreflight?.({
      requestId,
      sessionId: params.sessionId,
      model,
    });

    const started = Date.now();
    return this.adapter.chat(messages, params.options, params.signal).then(({ stream, final }) => {
      const wrappedFinal = final
        .then((f) => {
          this.telemetry?.onCompletion?.({
            requestId,
            model,
            latencyMs: Date.now() - started,
            usage: f.usage,
            finishReason: f.finishReason,
          });
          return f;
        })
        .catch((err) => {
          this.telemetry?.onError?.({ requestId, model, error: err });
          throw err;
        });
      return { stream, final: wrappedFinal };
    });
  }

  async moderate(_params: { text: string }) {
    // Placeholder: delegate to prompt/policy modules when available
    return { action: 'allow' as const };
  }

  tools() {
    // Placeholder: could expose registered tool schemas
    return { list: () => (this.hooks ? [] : []) };
  }
}

function makeId() {
  // Lightweight, non-crypto unique id for request correlation
  return 'req_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}
