/* eslint-env node */
/* eslint-disable no-console */
/* global console */
import { defaultPromptHooks, LLMClient, OllamaAdapter } from '../index';

const baseUrl = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
const model = process.env.OLLAMA_MODEL ?? 'mistral:instruct';
const prompt = process.argv.slice(2).join(' ') || 'Say hello';

async function main() {
  const client = new LLMClient({
    adapter: new OllamaAdapter({ baseUrl }),
    hooks: defaultPromptHooks,
  });

  console.log(`[example] Using Ollama at ${baseUrl}, model=${model}`);
  console.log(`[example] Prompt: ${prompt}`);

  const { stream, final } = await client.completeChat({
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    options: { model, temperature: 0.2 },
  });

  process.stdout.write('\n[stream] ');
  for await (const d of stream) {
    if (d.type === 'text' && d.text) process.stdout.write(d.text);
  }

  const summary = await final;
  process.stdout.write('\n\n');
  console.log('[final]', {
    finishReason: summary.finishReason,
    usage: summary.usage,
    model: summary.model,
  });
}

main().catch((err) => {
  console.error('[error]', err?.message ?? err);
  console.error(
    '\nTroubleshooting:\n- Ensure Ollama is running locally.\n- Ensure the model is available (e.g., mistral:instruct).',
  );
  process.exit(1);
});
