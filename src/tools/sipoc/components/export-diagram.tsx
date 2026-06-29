import type { SIPOCDiagram, SIPOCItem, SIPOCProcess } from "@/tools/sipoc/types";
import type { ExportOptions } from "@/lib/export/types";

interface ExportDiagramProps {
  diagram: SIPOCDiagram;
  pathLabels: string[];
  options: ExportOptions;
}

function cmToPx(cm: number): number {
  return Math.round(cm * 37.795);
}

function resolveColor(options: ExportOptions, key: "header" | "card" | "accent" | "background" | "text"): string {
  return options.colors[key] ?? "#ffffff";
}

function textColorClass(color: string): string {
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "text-zinc-100" : "text-zinc-900";
}

interface ColumnProps {
  title: string;
  subtitle: string;
  items: SIPOCItem[];
  options: ExportOptions;
  layout: string;
}

function Column({ title, subtitle, items, options, layout }: ColumnProps) {
  const cardBg = resolveColor(options, "card");
  const accentBg = resolveColor(options, "accent");
  const textClr = resolveColor(options, "text");
  const isFlat = layout === "flat";

  return (
    <section
      className="rounded-2xl p-4 shadow-sm"
      style={{
        backgroundColor: accentBg,
        border: isFlat ? "none" : `1px solid ${adjustAlpha(cardBg, 0.3)}`,
      }}
    >
      <header
        className="mb-3 pb-2"
        style={{
          borderBottom: isFlat ? "none" : `1px solid ${adjustAlpha(cardBg, 0.3)}`,
        }}
      >
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: textClr }}>
          {title}
        </h3>
        <p className="text-xs uppercase tracking-wide" style={{ color: adjustTextLight(textClr) }}>
          {subtitle}
        </p>
      </header>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li
            className="rounded-lg border border-dashed px-3 py-2 text-sm"
            style={{
              backgroundColor: cardBg,
              borderColor: adjustAlpha(cardBg, 0.5),
              color: adjustTextLight(textClr),
            }}
          >
            Sin elementos
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className={`${isFlat ? "" : "rounded-lg shadow-sm border"} px-3 py-2 text-sm`}
              style={{
                backgroundColor: cardBg,
                color: textClr,
                borderColor: isFlat ? "transparent" : adjustAlpha(cardBg, 0.3),
                borderBottom: isFlat ? `1px solid ${adjustAlpha(cardBg, 0.3)}` : undefined,
              }}
            >
              {item.label}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function ProcessColumn({ processes, options, layout }: { processes: SIPOCProcess[]; options: ExportOptions; layout: string }) {
  const accentBg = resolveColor(options, "accent");
  const cardBg = resolveColor(options, "card");
  const textClr = resolveColor(options, "text");
  const isFlat = layout === "flat";

  return (
    <section
      className="rounded-2xl p-4 shadow-sm"
      style={{
        backgroundColor: accentBg,
        border: isFlat ? "none" : `1px solid ${adjustAlpha(cardBg, 0.3)}`,
      }}
    >
      <header
        className="mb-3 pb-2"
        style={{
          borderBottom: isFlat ? "none" : `1px solid ${adjustAlpha(cardBg, 0.3)}`,
        }}
      >
        <h3 className="text-lg font-semibold tracking-tight" style={{ color: textClr }}>
          Proceso
        </h3>
        <p className="text-xs uppercase tracking-wide" style={{ color: adjustTextLight(textClr) }}>
          Actividades y subprocesos
        </p>
      </header>

      <ul className="space-y-2">
        {processes.length === 0 ? (
          <li
            className="rounded-lg border border-dashed px-3 py-2 text-sm"
            style={{
              backgroundColor: cardBg,
              borderColor: adjustAlpha(cardBg, 0.5),
              color: adjustTextLight(textClr),
            }}
          >
            Sin procesos
          </li>
        ) : (
          processes.map((process) => (
            <li
              key={process.id}
              className={`${isFlat ? "" : "rounded-lg shadow-sm border"} px-3 py-2 text-sm`}
              style={{
                backgroundColor: cardBg,
                color: textClr,
                borderColor: isFlat ? "transparent" : adjustAlpha(cardBg, 0.3),
                borderBottom: isFlat ? `1px solid ${adjustAlpha(cardBg, 0.3)}` : undefined,
              }}
            >
              <p>{process.label}</p>
              {process.child ? (
                <span className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium" style={{ backgroundColor: adjustAlpha("#f97316", 0.15), color: "#c2410c" }}>
                  Con sub-SIPOC
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function adjustAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function adjustTextLight(baseColor: string): string {
  const hex = baseColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? `rgba(24,24,27,0.5)` : `rgba(250,250,250,0.6)`;
}

export function ExportDiagram({ diagram, pathLabels, options }: ExportDiagramProps) {
  const routeText = pathLabels.join(" > ");
  const dateText = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const bg = resolveColor(options, "background");
  const headerBg = resolveColor(options, "header");
  const cardBg = resolveColor(options, "card");
  const textClr = resolveColor(options, "text");
  const layout = options.layout;
  const showTitle = options.fields.includes("title");
  const showScope = options.fields.includes("scope");
  const showDate = options.fields.includes("date");

  const sizePx = options.size.unit === "cm" ? cmToPx(options.size.value) : options.size.value;
  const scopeText = [diagram.processStart, diagram.processEnd].filter(Boolean).join(" → ");

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
      {/* Header */}
      <header
        className="mb-6 rounded-2xl border p-5 shadow-sm"
        style={{
          backgroundColor: headerBg,
          borderColor: adjustAlpha(cardBg, 0.3),
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: adjustTextLight(textClr) }}>
              Diagrama SIPOC
            </p>
            {showTitle && (
              <h1 className="mt-1 text-3xl font-bold tracking-tight" style={{ color: textClr }}>
                {diagram.title || "Sin titulo"}
              </h1>
            )}
            {showScope && scopeText && (
              <p className="mt-2 text-sm" style={{ color: adjustTextLight(textClr) }}>
                Alcance: {scopeText}
              </p>
            )}
            <p className="mt-2 text-sm" style={{ color: adjustTextLight(textClr) }}>
              Ruta: {routeText}
            </p>
          </div>
          {showDate && (
            <div
              className="rounded-xl border px-3 py-2 text-right shadow-sm"
              style={{
                backgroundColor: cardBg,
                borderColor: adjustAlpha(cardBg, 0.3),
              }}
            >
              <p className="text-[11px] uppercase tracking-wide" style={{ color: adjustTextLight(textClr) }}>
                Exportado
              </p>
              <p className="text-sm font-medium" style={{ color: textClr }}>
                {dateText || "--/--/----, --:--"}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Body */}
      <main className="grid grid-cols-5 gap-4">
        <Column title="Proveedores" subtitle="Suppliers" items={diagram.suppliers} options={options} layout={layout} />
        <Column title="Entradas" subtitle="Inputs" items={diagram.inputs} options={options} layout={layout} />
        <ProcessColumn processes={diagram.processes} options={options} layout={layout} />
        <Column title="Salidas" subtitle="Outputs" items={diagram.outputs} options={options} layout={layout} />
        <Column title="Clientes" subtitle="Customers" items={diagram.customers} options={options} layout={layout} />
      </main>

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
