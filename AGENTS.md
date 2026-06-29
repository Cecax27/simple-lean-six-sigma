# AGENTS.md — Simple Lean Six Sigma

## What this is

Next.js 16 App Router app (src/) — a multi-tool platform for Lean Six Sigma. UI is entirely in Spanish. Uses React 19, Tailwind 3, shadcn (base-nova style), Zustand for state.

## Commands

- `pnpm dev` — dev server at localhost:3000
- `pnpm lint` — ESLint (flat config, next/core-web-vitals)
- `pnpm typecheck` — `tsc --noEmit` (strict mode)
- `pnpm build` — production build

No test framework is set up. No CI workflows exist.

## Path alias

`@/*` maps to `./src/*`. Always use `@/` imports.

## Key architecture

### Platform

- `src/tools/registry.ts` — tool registry, lists all available tools with metadata
- `src/store/docs-store.ts` — multi-document store (persisted to localStorage), central document management
- `src/store/preferences-store.ts` — theme/preferences (localStorage)
- `src/components/platform/platform-sidebar.tsx` — persistent left sidebar (brand + tool nav + doc list)
- `src/app/(platform)/` — route group with shared platform chrome

### SIPOC tool

- `src/tools/sipoc/types.ts` — `SIPOCDiagram`, `SIPOCProcess`, `SIPOCItem`
- `src/tools/sipoc/store.ts` — per-doc SIPOC working store
- `src/tools/sipoc/tree.ts` — tree manipulation (nesting up to 3 levels)
- `src/tools/sipoc/xml.ts` — XML serialization/deserialization (root tag: `<sipoc>`)
- `src/tools/sipoc/components/` — all SIPOC editor UI components (editor, tree panel, export, etc.)

### Shared

- `src/components/ui/` — shadcn components (do not edit manually, use `shadcn` CLI)
- `src/lib/utils.ts` — `cn()` helper

## Conventions

- All user-facing text must be in Spanish. Code, comments, docs, and commit messages must be in English.
- shadcn components are in `src/components/ui/`. Add new ones via the `shadcn` CLI, not by hand.
- Dark mode uses CSS class toggle (`dark` class on `<html>`) with CSS variables defined in `src/app/globals.css`.
- Components use `"use client"` directive where needed (store access, browser APIs).
- Layout wraps everything in `Providers` (theme + tooltip provider) at `src/app/providers.tsx`.

## Adding a new tool

1. Add a `ToolDescriptor` to `src/tools/registry.ts`
2. Create a route under `src/app/<slug>/[docId]/page.tsx`
3. Implement the tool's types, store, and components under `src/tools/<slug>/`
