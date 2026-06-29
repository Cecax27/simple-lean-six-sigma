# Contributing to Simple Lean Six Sigma

Thanks for your interest in contributing.

## Getting started

1. Fork the repo and clone it
2. Install dependencies: `pnpm install`
3. Start the dev server: `pnpm dev` (http://localhost:3000)

## Quality checks

```bash
pnpm typecheck    # TypeScript --noEmit (strict mode)
pnpm lint         # ESLint (flat config, next/core-web-vitals)
pnpm build        # Production build
```

Make sure all three pass before opening a PR.

## Coding conventions

- **Language:** UI text must be in Spanish. Code, comments, docs, and commit messages must be in English.
- **shadcn/ui components** live in `src/components/ui/`. Add new ones via the `shadcn` CLI, never by hand.
- **Dark mode** uses CSS class toggle (`.dark` on `<html>`) with CSS variables defined in `src/app/globals.css`.
- **`"use client"`** directive must be used where a component accesses Zustand stores or browser APIs.
- **Imports** use the `@/*` path alias (`./src/*`).

## Adding a new tool

1. Define it in `src/tools/registry.ts` (`ToolDescriptor`)
2. Create a route under `src/app/<slug>/[docId]/page.tsx`
3. Implement the editor component and state in `src/tools/<slug>/`

The platform sidebar, dashboard, and landing grid are all driven by the tool registry.

## Commit style

Keep commits focused and describe what changed in the imperative tone (e.g., "add Pareto chart tool", "fix SIPOC XML export nesting").

## Communication

- Open an issue for bugs, feature requests, or questions.
- For large changes, open an issue first to discuss before coding.
