# Naming rules

- Page components: PascalCase + `.page.svelte` (e.g., `CharacterList.page.svelte`)
- Widget components: PascalCase + `.widget.svelte` (e.g., `InputBar.widget.svelte`)
- Entity components: PascalCase + `.entity.svelte` (e.g., `Character.entity.svelte`)
- Stores: kebab-case + `.store.ts` (e.g., `characters.store.ts`)
- Actions: camelCase VerbNoun + `.action.ts` (e.g., `sendTurn.action.ts`)
- APIs: kebab-case + `.api.ts` (e.g., `chat.api.ts`)

Paths must live under `apps/web/src/lib/features/<feature>/...`.
