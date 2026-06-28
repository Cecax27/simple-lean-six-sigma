import type { IshikawaDiagram } from "@/tools/ishikawa/types";
import type { ExportOptions } from "@/lib/export/types";

function cmToPx(cm: number): number {
  return Math.round(cm * 37.795);
}

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

function adjustAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function textLight(baseColor: string): string {
  const hex = baseColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? `rgba(250,250,250,0.6)` : `rgba(24,24,27,0.5)`;
}

interface ExportDiagramProps {
  diagram: IshikawaDiagram;
  options: ExportOptions;
}

export function ExportDiagram({ diagram, options }: ExportDiagramProps) {
  const dateText = formatDate();
  const layout = options.layout as "pez" | "compacto" | "arbol";
  const showTitle = options.fields.includes("title");
  const showEffect = options.fields.includes("effect");
  const showDate = options.fields.includes("date");

  const bg = options.colors.background ?? "#ffffff";
  const headerBg = options.colors.header ?? "#fafafa";
  const cardBg = options.colors.card ?? "#ffffff";
  const textClr = options.colors.text ?? "#18181b";

  const sizePx = options.size.unit === "cm" ? cmToPx(options.size.value) : options.size.value;

  return (
    <article
      className="relative rounded-3xl border p-8 shadow-lg"
      style={{
        width: `${sizePx}px`,
        backgroundColor: bg,
        borderColor: adjustAlpha(cardBg, 0.3),
        color: textClr,
      }}
    >
      <header
        className="mb-6 rounded-2xl border p-5 shadow-sm"
        style={{
          backgroundColor: headerBg,
          borderColor: adjustAlpha(cardBg, 0.3),
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: textLight(textClr) }}>
              Diagrama de Ishikawa
            </p>
            {showTitle && (
              <h1 className="mt-1 text-3xl font-bold tracking-tight" style={{ color: textClr }}>
                {safeName(diagram.title)}
              </h1>
            )}
            {showEffect && (
              <p className="mt-2 text-sm font-medium" style={{ color: adjustAlpha(textClr, 0.8) }}>
                Efecto: {safeName(diagram.effect) || "Sin definir"}
              </p>
            )}
          </div>
          {showDate && (
            <div
              className="rounded-xl border px-3 py-2 text-right shadow-sm"
              style={{
                backgroundColor: cardBg,
                borderColor: adjustAlpha(cardBg, 0.3),
              }}
            >
              <p className="text-[11px] uppercase tracking-wide" style={{ color: textLight(textClr) }}>
                Exportado
              </p>
              <p className="text-sm font-medium" style={{ color: textClr }}>
                {dateText}
              </p>
            </div>
          )}
        </div>
      </header>

      {layout === "pez" && <FishboneSvg diagram={diagram} textColor={textClr} />}
      {layout === "compacto" && <CompactLayout diagram={diagram} bg={bg} cardBg={cardBg} textClr={textClr} />}
      {layout === "arbol" && <TreeLayout diagram={diagram} bg={bg} cardBg={cardBg} textClr={textClr} />}

      <footer className="mt-6 border-t pt-4 text-center text-xs" style={{ borderColor: adjustAlpha(textClr, 0.15), color: textLight(textClr) }}>
        Exportado desde Simple Lean Six Sigma — simple-lss
      </footer>

      {/* Watermark */}
      {options.watermark.enabled && options.watermark.text && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
          style={{ opacity: 0.08 }}
        >
          <p
            className="rotate-[-25deg] text-7xl font-black whitespace-nowrap"
            style={{ color: textClr }}
          >
            {options.watermark.text}
          </p>
        </div>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Fishbone SVG (classic Ishikawa / fishbone diagram)                */
/* ------------------------------------------------------------------ */

function FishboneSvg({ diagram, textColor }: { diagram: IshikawaDiagram; textColor: string }) {
  const { effect, categories } = diagram;
  const categoriesWithContent = categories.filter((cat) => cat.causes.length > 0 || cat.label.trim());
  const HEAD_X = 1380;
  const SPINE_Y = 320;
  const CAT_SPACING = Math.min(600 / Math.max(categoriesWithContent.length, 1), 90);

  const strokeColor = adjustAlpha(textColor, 0.5);
  const strokeThin = adjustAlpha(textColor, 0.25);
  const fillLight = adjustAlpha(textColor, 0.12);
  const textFill = textColor;
  const textMuted = adjustAlpha(textColor, 0.55);

  const startY = SPINE_Y - ((categoriesWithContent.length - 1) * CAT_SPACING) / 2;

  return (
    <svg viewBox="0 0 1500 640" className="w-full" role="img" aria-label="Diagrama de espina de pescado">
      {/* Spine */}
      <line x1={80} y1={SPINE_Y} x2={HEAD_X - 60} y2={SPINE_Y} stroke={strokeColor} strokeWidth={4} />

      {/* Fish head (effect box) */}
      <polygon
        points={`${HEAD_X - 60},${SPINE_Y - 50} ${HEAD_X - 10},${SPINE_Y} ${HEAD_X - 60},${SPINE_Y + 50}`}
        fill={fillLight}
        stroke={strokeColor}
        strokeWidth={3}
      />
      <foreignObject x={HEAD_X - 50} y={SPINE_Y - 40} width={100} height={80}>
        <div className="flex h-full items-center justify-center text-center text-[11px] font-semibold leading-tight" style={{ color: textFill }}>
          {effect || "Efecto"}
        </div>
      </foreignObject>
      <text x={HEAD_X + 110} y={SPINE_Y + 5} className="text-sm font-semibold" fill={textFill} fontSize={14}>
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
            <line x1={x} y1={SPINE_Y} x2={x} y2={extremeY} stroke={strokeThin} strokeWidth={2.5} />
            {/* Category label */}
            <text x={labelX} y={labelY} textAnchor="middle" fill={textFill} fontSize={13} fontWeight={600}>
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
                    stroke={strokeThin}
                    strokeWidth={1.5}
                  />
                  <text
                    x={toothX - 5}
                    y={toothY - (isAbove ? 6 : -14)}
                    textAnchor="end"
                    fill={textMuted}
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

function CompactLayout({ diagram, bg, cardBg, textClr }: { diagram: IshikawaDiagram; bg: string; cardBg: string; textClr: string }) {
  const { effect, categories } = diagram;

  return (
    <div className="space-y-4">
      {effect && (
        <div className="rounded-xl border px-4 py-3 text-center" style={{ borderColor: adjustAlpha(textClr, 0.15), backgroundColor: adjustAlpha(textClr, 0.05) }}>
          <p className="text-xs uppercase tracking-wide" style={{ color: textLight(textClr) }}>Efecto (problema)</p>
          <p className="mt-1 text-lg font-bold" style={{ color: textClr }}>{effect}</p>
        </div>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 3)}, 1fr)` }}>
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-xl border p-4 shadow-sm" style={{ borderColor: adjustAlpha(textClr, 0.15), backgroundColor: cardBg }}>
            <h3 className="mb-2 text-sm font-semibold" style={{ color: textClr }}>{cat.label}</h3>
            {cat.causes.length === 0 ? (
              <p className="text-xs" style={{ color: textLight(textClr) }}>Sin causas</p>
            ) : (
              <ul className="space-y-1.5">
                {cat.causes.map((cause) => (
                  <li key={cause.id} className="rounded-md border px-3 py-1.5 text-xs" style={{ borderColor: adjustAlpha(textClr, 0.12), backgroundColor: bg }}>
                    <span className="font-medium" style={{ color: textClr }}>{cause.label}</span>
                    {cause.description && (
                      <p className="mt-0.5 text-[11px]" style={{ color: textLight(textClr) }}>{cause.description}</p>
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

function TreeLayout({ diagram, bg, cardBg, textClr }: { diagram: IshikawaDiagram; bg: string; cardBg: string; textClr: string }) {
  const { effect, categories } = diagram;

  return (
    <div className="space-y-3">
      {/* Root — effect */}
      <div className="rounded-xl border px-5 py-4" style={{ borderColor: adjustAlpha(textClr, 0.15), backgroundColor: adjustAlpha(textClr, 0.05) }}>
        <p className="text-[11px] uppercase tracking-wide" style={{ color: textLight(textClr) }}>Efecto (problema)</p>
        <p className="mt-1 text-lg font-bold" style={{ color: textClr }}>{effect || "Sin definir"}</p>
      </div>

      {/* Categories */}
      <div className="ml-6 space-y-3 pl-6" style={{ borderLeft: `2px solid ${adjustAlpha(textClr, 0.2)}` }}>
        {categories.map((cat) => (
          <div key={cat.id} className="space-y-2">
            <p className="text-sm font-semibold" style={{ color: textClr }}>&#x25B8; {cat.label}</p>
            {cat.causes.length === 0 ? (
              <p className="ml-6 text-xs" style={{ color: textLight(textClr) }}>Sin causas</p>
            ) : (
              <ul className="ml-6 space-y-1.5 pl-4" style={{ borderLeft: `2px solid ${adjustAlpha(textClr, 0.1)}` }}>
                {cat.causes.map((cause) => (
                  <li key={cause.id} className="text-sm" style={{ color: adjustAlpha(textClr, 0.85) }}>
                    <span className="font-medium">&#x2022; {cause.label}</span>
                    {cause.description && (
                      <p className="ml-4 mt-0.5 text-xs" style={{ color: textLight(textClr) }}>
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
