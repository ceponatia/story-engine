// Shared DTOs and types (placeholder)
export interface User {
  id: string;
  email: string;
}
export interface Character {
  id: string;
  name: string;
  sheet?: Record<string, unknown>;
}
export interface Session {
  id: string;
  title: string;
  characterId?: string;
  world?: string;
  tags?: string[];
}
export interface Turn {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
}

// Studio navigation shared UI contracts (safe to share)
export type Breadcrumb = { href?: string; label: string };
export type MemorySnippet = {
  id: string;
  kind: 'player' | 'world' | 'plot';
  text: string;
  score: number;
  source?: string;
  ts: string;
};
export type Command = {
  id: string;
  title: string;
  run: () => void;
  hint?: string;
  tags?: string[];
};
