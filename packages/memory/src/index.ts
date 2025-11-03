// Memory interfaces (placeholder)
// NOTE: Retrieved and MemorySnippet (in packages/types) are intentionally duplicated.
// These packages are minimal source-only packages without proper workspace setup.
// To consolidate, convert packages/types to a proper npm package with package.json.
export interface MemoryChunk {
  id: string;
  sessionId: string;
  text: string;
  embedding?: number[];
}
export interface VectorStore {
  upsert: (chunks: readonly MemoryChunk[]) => Promise<void>;
  query: (sessionId: string, text: string, k: number) => Promise<readonly MemoryChunk[]>;
}

export type Retrieved = {
  id: string;
  kind: 'player' | 'world' | 'plot';
  text: string;
  score: number;
  source?: string;
  ts: string;
};

export function groupAndSort(snippets: readonly Retrieved[]) {
  const groups: Record<'player' | 'world' | 'plot', Retrieved[]> = {
    player: [],
    world: [],
    plot: [],
  };
  for (const s of snippets) groups[s.kind].push(s);
  for (const k of Object.keys(groups) as Array<keyof typeof groups>) {
    groups[k] = groups[k].toSorted((a, b) => b.score - a.score || b.ts.localeCompare(a.ts));
  }
  return groups;
}
