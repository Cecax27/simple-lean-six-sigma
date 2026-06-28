import type { IshikawaDiagram } from "@/tools/ishikawa/types";

function safeName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Sin titulo";
}

function formatDate(): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

interface ExportDiagramProps {
  diagram: IshikawaDiagram;
  layout: "pez" | "compacto" | "arbol";
}

export function ExportDiagram({ diagram, layout }: ExportDiagramProps) {
  const dateText = formatDate();

  return (
    <article className="w-[1600px] rounded-3xl border border-zinc-200 bg-white p-8 text-zinc-900 shadow-lg">
      <header className="mb-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Diagrama de Ishikawa
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
              {safeName(diagram.title)}
            </h1>
            <p className="mt-2 text-sm font-medium text-zinc-700">
              Efecto: {safeName(diagram.effect) || "Sin definir"}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-right shadow-sm">
            <p className="text-[11px] uppercase tracking-wide text-zinc-500">Exportado</p>
            <p className="text-sm font-medium text-zinc-700">{dateText}</p>
          </div>
        </div>
      </header>

      {layout === "pez" && <FishboneSvg diagram={diagram} />}
      {layout === "compacto" && <CompactLayout diagram={diagram} />}
      {layout === "arbol" && <TreeLayout diagram={diagram} />}

      <footer className="mt-6 border-t border-zinc-200 pt-4 text-center text-xs text-zinc-400">
        Exportado desde Simple Lean Six Sigma — simple-lss
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Fishbone SVG (classic Ishikawa / fishbone diagram)                */
/* ------------------------------------------------------------------ */

function FishboneSvg({ diagram }: { diagram: IshikawaDiagram }) {
  const { effect, categories } = diagram;
  const categoriesWithContent = categories.filter((cat) => cat.causes.length > 0 || cat.label.trim());
  const WIDTH = 1500;
  const HEAD_X = 1380;
  const SPINE_Y = 320;
  const MAX_CAUSES_PER_CAT = Math.max(...categoriesWithContent.map((c) => c.causes.length), 1);
  const CAT_SPACING = Math.min(600 / Math.max(categoriesWithContent.length, 1), 90);

  const startY = SPINE_Y - ((categoriesWithContent.length - 1) * CAT_SPACING) / 2;

  return (
    <svg viewBox="0 0 1500 640" className="w-full" role="img" aria-label="Diagrama de espina de pescado">
      {/* Spine */}
      <line x1={80} y1={SPINE_Y} x2={HEAD_X - 60} y2={SPINE_Y} stroke="#52525b" strokeWidth={4} />

      {/* Fish head (effect box) */}
      <polygon
        points={`${HEAD_X - 60},${SPINE_Y - 50} ${HEAD_X - 10},${SPINE_Y} ${HEAD_X - 60},${SPINE_Y + 50}`}
        fill="#e4e4e7"
        stroke="#52525b"
        strokeWidth={3}
      />
      <foreignObject x={HEAD_X - 50} y={SPINE_Y - 40} width={100} height={80}>
        <div className="flex h-full items-center justify-center text-center text-[11px] font-semibold leading-tight text-zinc-800">
          {effect || "Efecto"}
        </div>
      </foreignObject>
      <text x={HEAD_X + 110} y={SPINE_Y + 5} className="text-sm font-semibold" fill="#3f3f46" fontSize={14}>
        Efecto
      </text>

      {/* Categories (bones) */}
      {categoriesWithContent.map((category, catIndex) => {
        const isAbove = catIndex % 2 === 0;
        const x = HEAD_X - 350 - catIndex * 90;
        const y = startY + catIndex * CAT_SPACING;
        const extremeY = isAbove ? y - 180 : y + 180;
        const labelX = x + (isAbove ? 15 : 15);
        const labelY = isAbove ? y - 190 : y + 205;

        return (
          <g key={category.id}>
            {/* Main bone */}
            <line x1={x} y1={SPINE_Y} x2={x} y2={extremeY} stroke="#a1a1aa" strokeWidth={2.5} />
            {/* Category label */}
            <text x={labelX} y={labelY} textAnchor="middle" fill="#3f3f46" fontSize={13} fontWeight={600}>
              {category.label}
            </text>

            {/* Sub-causes (teeth) */}
            {category.causes.map((cause, causeIndex) => {
              const teethCount = category.causes.length;
              const segmentSpan = 160;
              const segmentStart = isAbove ? SPINE_Y - segmentSpan : SPINE_Y;
              const spacing = segmentSpan / Math.max(teethCount + 1, 2);
              const offset = spacing * (causeIndex + 1);
              const toothY = isAbove ? SPINE_Y - offset : SPINE_Y + offset;
              const toothX = x - 60;

              return (
                <g key={cause.id}>
                  <line
                    x1={x}
                    y1={y + (isAbove ? 0 : 0)}
                    x2={toothX}
                    y2={toothY}
                    stroke="#d4d4d8"
                    strokeWidth={1.5}
                  />
                  <text
                    x={toothX - 5}
                    y={toothY - (isAbove ? 6 : -14)}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize={10}
                  >
                    {cause.label}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Compact layout (categories as columns, causes as bullet list)      */
/* ------------------------------------------------------------------ */

function CompactLayout({ diagram }: { diagram: IshikawaDiagram }) {
  const { effect, categories } = diagram;

  return (
    <div className="space-y-4">
      {effect && (
        <div className="rounded-xl border border-zinc-200 bg-rose-50 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Efecto (problema)</p>
          <p className="mt-1 text-lg font-bold text-zinc-900">{effect}</p>
        </div>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)` }}>
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-zinc-800">{cat.label}</h3>
            {cat.causes.length === 0 ? (
              <p className="text-xs text-zinc-400">Sin causas</p>
            ) : (
              <ul className="space-y-1.5">
                {cat.causes.map((cause) => (
                  <li key={cause.id} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-700">
                    <span className="font-medium">{cause.label}</span>
                    {cause.description && (
                      <p className="mt-0.5 text-[11px] text-zinc-400">{cause.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tree layout (hierarchical indented list)                           */
/* ------------------------------------------------------------------ */

function TreeLayout({ diagram }: { diagram: IshikawaDiagram }) {
  const { effect, categories } = diagram;

  return (
    <div className="space-y-3">
      {/* Root — effect */}
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4">
        <p className="text-[11px] uppercase tracking-wide text-rose-500">Efecto (problema)</p>
        <p className="mt-1 text-lg font-bold text-zinc-900">{effect || "Sin definir"}</p>
      </div>

      {/* Categories */}
      <div className="ml-6 space-y-3 border-l-2 border-zinc-200 pl-6">
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-2">
            <p className="text-sm font-semibold text-zinc-800">&#x25B8; {cat.label}</p>
            {cat.causes.length === 0 ? (
              <p className="ml-6 text-xs text-zinc-400">Sin causas</p>
            ) : (
              <ul className="ml-6 space-y-1.5 border-l-2 border-zinc-100 pl-4">
                {cat.causes.map((cause) => (
                  <li key={cause.id} className="text-sm text-zinc-700">
                    <span className="font-medium">&#x2022; {cause.label}</span>
                    {cause.description && (
                      <p className="ml-4 mt-0.5 text-xs text-zinc-400">
                        {cause.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
