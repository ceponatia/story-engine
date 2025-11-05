/**
 * Minimal Ollama adapter targeting local HTTP API.
 * Streaming protocol: text/event-stream with JSON lines containing {message:{content}, done}
 */
export class OllamaAdapter {
    baseUrl;
    constructor(opts) {
        this.baseUrl = opts?.baseUrl ?? 'http://localhost:11434';
    }
    async capabilities(model) {
        return {
            id: `ollama:${model}`,
            tools: false,
            jsonMode: true,
        };
    }
    async chat(messages, opts, signal) {
        const g = globalThis;
        const Controller = g.AbortController;
        const controller = Controller ? new Controller() : { signal: undefined, abort: () => { } };
        if (signal && typeof signal?.addEventListener === 'function') {
            signal.addEventListener('abort', () => controller.abort());
        }
        const URLCtor = (g.URL ??
            ((path, base) => `${base.replace(/\/$/, '')}${path}`));
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
        const _fetch = g.fetch;
        const res = await _fetch(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        if (!res.ok || !res.body) {
            throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
        }
        const reader = res.body.getReader();
        let finishReason = 'stop';
        async function* stream() {
            const Decoder = g.TextDecoder;
            const decoder = new (Decoder ??
                class {
                    decode(u) {
                        return Array.from(u)
                            .map((c) => String.fromCharCode(c))
                            .join('');
                    }
                })();
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n');
                buffer = parts.pop() ?? '';
                for (const line of parts) {
                    const trimmed = line.trim();
                    if (!trimmed)
                        continue;
                    // Ollama streams JSON per line
                    try {
                        const chunk = JSON.parse(trimmed);
                        if (chunk?.message?.content) {
                            const text = chunk.message.content;
                            yield { type: 'text', text };
                        }
                        if (chunk?.done) {
                            finishReason = 'stop';
                        }
                    }
                    catch {
                        // ignore parse errors on partial lines
                    }
                }
            }
            if (buffer.length) {
                try {
                    const chunk = JSON.parse(buffer);
                    if (chunk?.message?.content) {
                        const text = chunk.message.content;
                        yield { type: 'text', text };
                    }
                    if (chunk?.done) {
                        finishReason = 'stop';
                    }
                }
                catch {
                    /* noop */
                }
            }
            return;
        }
        const final = (async () => {
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
//# sourceMappingURL=ollama.js.map