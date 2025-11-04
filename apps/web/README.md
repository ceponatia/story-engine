# apps/web

Placeholder scaffold for the SvelteKit frontend. Files here are intentionally empty stubs to establish structure; implementation will be added later.

## Tests

- Runes enabled for tests via `@sveltejs/vite-plugin-svelte` with `compilerOptions.runes = true` in `vitest.config.ts`.
- Aliases `$lib` and `$routes` are configured in test resolve aliases.
- DOM shim loads from `src/lib/test/setup.ts` (includes `@testing-library/jest-dom` and `ResizeObserver`).

Run tests from the app directory or use root scripts:

```sh
# from repo root
pnpm test:web         # run once
pnpm test:web:watch   # watch mode
pnpm test:web:ui      # Vitest UI

# or from apps/web
pushd apps/web
pnpm vitest run
popd
```
