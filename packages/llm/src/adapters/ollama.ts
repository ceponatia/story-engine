import type {
  ChatMessage,
  CompletionDelta,
  CompletionFinal,
  CompletionOptions,
  ProviderAdapter,
  ProviderCapabilities,
  AbortSignalLike,
} from '../types';

/**
 * Minimal Ollama adapter targeting local HTTP API.
 * Streaming protocol: text/event-stream with JSON lines containing {message:{content}, done}
 */
export class OllamaAdapter implements ProviderAdapter {
  baseUrl: string;

  constructor(opts?: { baseUrl?: string }) {
    this.baseUrl = opts?.baseUrl ?? 'http://localhost:11434';
  }

  async capabilities(model: string): Promise<ProviderCapabilities> {
    return {
      id: `ollama:${model}`,
      tools: false,
      jsonMode: true,
    };
  }

  async chat(messages: ChatMessage[], opts: CompletionOptions, signal?: AbortSignalLike) {
    const g: any = globalThis as any;
    const Controller = g.AbortController;
    const controller = Controller ? new Controller() : { signal: undefined, abort: () => {} };
    if (signal && typeof signal?.addEventListener === 'function') {
      signal.addEventListener('abort', () => controller.abort());
    }

    const URLCtor = (g.URL ?? ((path: string, base: string) => `${base.replace(/\/$/, '')}${path}`)) as any;
    const url = URLCtor('/api/chat', this.baseUrl).toString?.() ?? URLCtor('/api/chat', this.baseUrl);
    const body = {
      model: opts.model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      stream: true,
      options: {
        temperature: opts.temperature,
        top_p: opts.top_p,
        num_predict: opts.max_tokens,
        seed: opts.seed,
      },
    };

    const _fetch: any = g.fetch;
    const res = await _fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: (controller as any).signal,
    });

    if (!res.ok || !res.body) {
      throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
    }

    const reader = res.body.getReader();

    let finishReason: CompletionFinal['finishReason'] = 'stop';

    async function* stream(): AsyncIterable<CompletionDelta> {
      const Decoder = (g as any).TextDecoder;
      const decoder = new (Decoder ?? class { decode(u: Uint8Array) { return Array.from(u).map((c) => String.fromCharCode(c)).join(''); } })();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n');
        buffer = parts.pop() ?? '';
        for (const line of parts) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          // Ollama streams JSON per line
          try {
            const chunk = JSON.parse(trimmed);
            if (chunk?.message?.content) {
              const text: string = chunk.message.content;
              yield { type: 'text', text };
            }
            if (chunk?.done) {
              finishReason = 'stop';
            }
          } catch {
            // ignore parse errors on partial lines
          }
        }
      }
      if (buffer.length) {
        try {
          const chunk = JSON.parse(buffer);
          if (chunk?.message?.content) {
            const text: string = chunk.message.content;
            yield { type: 'text', text };
          }
          if (chunk?.done) {
            finishReason = 'stop';
          }
        } catch { /* noop */ }
      }
      return;
    }

    const final: Promise<CompletionFinal> = (async () => {
      // Ollama does not return usage in stream; unknown here
      return {
        model: opts.model,
        finishReason,
        usage: { totalTokens: undefined },
        raw: undefined,
      };
    })();

    return { stream: stream(), final };
  }
}
