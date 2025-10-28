import { describe, it, expect } from 'vitest';

import { LLMClient } from '../src/client';
import type {
  ProviderAdapter,
  ChatMessage,
  CompletionDelta,
  CompletionFinal,
  CompletionOptions,
} from '../src/types';

class MockAdapter implements ProviderAdapter {
  async capabilities(model: string) {
    return { id: `mock:${model}` };
  }
  async chat(messages: ChatMessage[], opts: CompletionOptions) {
    async function* stream(): AsyncIterable<CompletionDelta> {
      yield { type: 'text', text: 'Hello' };
      yield { type: 'text', text: ', world' };
    }
    const final: Promise<CompletionFinal> = Promise.resolve({
      model: opts.model,
      finishReason: 'stop',
      usage: {},
    });
    return { stream: stream(), final };
  }
}

describe('LLMClient.completeChat', () => {
  it('streams deltas and resolves final', async () => {
    const client = new LLMClient({ adapter: new MockAdapter() });
    const res = await client.completeChat({
      messages: [{ role: 'user', content: 'Hi' }],
      options: { model: 'test' },
    });
    let text = '';
    for await (const d of res.stream) {
      if (d.type === 'text' && d.text) text += d.text;
    }
    const final = await res.final;
    expect(text).toBe('Hello, world');
    expect(final.finishReason).toBe('stop');
  });
});
