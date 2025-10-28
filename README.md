# Story‑Engine Monorepo

A role‑playing chatbot game where stories are interactive chat sessions. This repo uses a pnpm/Turborepo workspace with a SvelteKit web app, an Elysia API, shared packages, and background jobs.

- Architecture: see `dev-docs/architecture.md`, `dev-docs/architecture-summary.md`, `dev-docs/architecture-svelte.md`.
- Governance: see `.github/chatmodes` and prompt files in `.github/prompts`.

## Adding UI fast

- New feature: `pnpm run scaffold:feature -- --name chat`
- Page: `pnpm run scaffold:page -- --feature chat --name ChatSession`
- Widget: `pnpm run scaffold:widget -- --feature chat --name InputBar`
- Entity: `pnpm run scaffold:entity -- --feature chat --name Message`

## Adding UI

Use Plop generators to scaffold UI under `apps/web/src/lib/features/<feature>/...`:

- pnpm run scaffold:feature -- --name feature
- pnpm run scaffold:page -- --feature feature --name PascalName
- pnpm run scaffold:widget -- --feature feature --name PascalName
- pnpm run scaffold:entity -- --feature feature --name PascalName
- pnpm run scaffold:store -- --feature feature --name kebab
- pnpm run scaffold:action -- --feature feature --name camelVerbNoun
- pnpm run scaffold:api -- --feature feature --name kebab

See tools/naming-rules.md for required suffixes and casing.

## Quickstart (placeholder)

- Package manager: pnpm
- Node: 22.21.0

Install and bootstrap once scaffolds are populated.

## Workspaces

- apps/web — SvelteKit UI
- apps/api — Elysia API
- apps/jobs — Background workers
- packages/types, memory, config, utils, ui (optional), testing
- infra — docker/compose/IaC stubs

See `dev-docs/` for templates to generate concrete apps and packages.
