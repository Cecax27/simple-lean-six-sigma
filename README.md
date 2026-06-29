# Simple Lean Six Sigma

A minimalist web platform for Lean Six Sigma tools. Forget Excel and Word templates — focus on your data, anywhere on the web.

**UI in Spanish. Code and documentation in English. Open source (MIT).**

## Tools (current)

| Tool | Status |
|------|--------|
| [SIPOC](https://github.com/Cecax27/simple-lean-six-sigma) | Ready |
| Ishikawa (fishbone) | Coming soon |
| Pareto | Coming soon |
| 5 Whys | Coming soon |
| DMAIC | Coming soon |

## Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 3
- shadcn/ui (base-nova style)
- Zustand for state
- fast-xml-parser for XML import/export
- jspdf + html-to-image for PDF/PNG/SVG export

## Running locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Quality

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT — see [LICENSE](./LICENSE).

