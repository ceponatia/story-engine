# Story‑Engine Monorepo

A role‑playing chatbot game where stories are interactive chat sessions. This repo uses a pnpm/Turborepo workspace with a SvelteKit web app, an Elysia API, shared packages, and background jobs.

- Architecture: see `dev-docs/architecture.md`, `dev-docs/architecture-summary.md`, `dev-docs/architecture-svelte.md`.
- Governance: see `.github/chatmodes` and prompt files in `.github/prompts`.

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
