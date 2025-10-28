# @story-engine/llm

Provider-agnostic LLM facade and adapters for Story‑Engine.

- Public facade: `LLMClient`
- Adapters: `OllamaAdapter` (local runtime)
- Hooks: prompt assembly/sanitize
- Streaming: async iterable of token deltas + final usage

## Quick start

```ts
import { LLMClient, OllamaAdapter, defaultPromptHooks } from '@story-engine/llm';

const client = new LLMClient({
  adapter: new OllamaAdapter({ baseUrl: 'http://localhost:11434' }),
  hooks: defaultPromptHooks,
});

const { stream, final } = await client.completeChat({
  messages: [
    { role: 'system', content: 'You are helpful.' },
    { role: 'user', content: 'Say hello' },
  ],
  options: { model: 'mistral:instruct', temperature: 0.2 },
});

let text = '';
for await (const d of stream) {
  if (d.type === 'text' && d.text) text += d.text;
}
console.log('final:', await final);
```

## Notes

- This package is pure application logic (no HTTP server). Consumers own transport and configuration.
- All inputs/outputs are serializable and provider‑agnostic.
- Telemetry hooks are provided via `telemetry` init option; default is no‑op.
