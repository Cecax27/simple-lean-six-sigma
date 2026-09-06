import { ControlChartSvg, type ChartColors } from "@/tools/carta-control/components/control-chart-svg";
import {
  computeCenterLine,
  countOutOfControl,
  formatValue,
  isPointOutOfControl,
} from "@/tools/carta-control/chart";
import type { ControlChart } from "@/tools/carta-control/types";
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

const OUT_COLOR = "#ef4444";

interface ExportChartProps {
  chart: ControlChart;
  options: ExportOptions;
}

export function ExportChart({ chart, options }: ExportChartProps) {
  const dateText = formatDate();
  const layout = options.layout as "grafica" | "grafica-tabla";
  const showTitle = options.fields.includes("title");
  const showDate = options.fields.includes("date");
  const showLimits = options.fields.includes("limits");
  const showStats = options.fields.includes("stats");

  const bg = options.colors.background ?? "#ffffff";
  const headerBg = options.colors.header ?? "#fafafa";
  const cardBg = options.colors.card ?? "#ffffff";
  const textClr = options.colors.text ?? "#18181b";

  const sizePx = options.size.unit === "cm" ? cmToPx(options.size.value) : options.size.value;
  const chartWidth = Math.max(320, sizePx - 64);
  const chartHeight = Math.min(640, Math.max(320, Math.round(chartWidth * 0.5)));

  const colors: ChartColors = {
    text: textClr,
    grid: adjustAlpha(textClr, 0.15),
    axis: adjustAlpha(textClr, 0.6),
    line: adjustAlpha(textClr, 0.85),
    centerLine: adjustAlpha(textClr, 0.5),
    limit: OUT_COLOR,
    point: textClr,
    pointOut: OUT_COLOR,
    comment: adjustAlpha(textClr, 0.6),
    background: bg,
  };

  const centerLine = computeCenterLine(chart);
  const outCount = countOutOfControl(chart);
  const values = chart.points.map((point) => point.value);
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

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
      <header className="mb-6 rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: headerBg, borderColor: adjustAlpha(cardBg, 0.3) }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: adjustAlpha(textClr, 0.5) }}>
              Carta de Control
            </p>
            {showTitle && (
              <h1 className="mt-1 text-3xl font-bold tracking-tight" style={{ color: textClr }}>
                {safeName(chart.title)}
              </h1>
            )}
            {chart.unit ? (
              <p className="mt-2 text-sm font-medium" style={{ color: adjustAlpha(textClr, 0.8) }}>
                Unidad: {chart.unit}
              </p>
            ) : null}
          </div>
          {showDate && (
            <div className="rounded-xl border px-3 py-2 text-right shadow-sm" style={{ backgroundColor: cardBg, borderColor: adjustAlpha(cardBg, 0.3) }}>
              <p className="text-[11px] uppercase tracking-wide" style={{ color: adjustAlpha(textClr, 0.5) }}>
                Exportado
              </p>
              <p className="text-sm font-medium" style={{ color: textClr }}>
                {dateText}
              </p>
            </div>
          )}
        </div>

        {showLimits && (
          <div className="mt-4 flex flex-wrap gap-2 text-xs" style={{ color: textClr }}>
            <span className="rounded-md border px-2 py-1" style={{ borderColor: adjustAlpha(textClr, 0.15) }}>
              LCS: {chart.limits.upper.enabled ? formatValue(chart.limits.upper.value) : "—"}
            </span>
            <span className="rounded-md border px-2 py-1" style={{ borderColor: adjustAlpha(textClr, 0.15) }}>
              LCI: {chart.limits.lower.enabled ? formatValue(chart.limits.lower.value) : "—"}
            </span>
            <span className="rounded-md border px-2 py-1" style={{ borderColor: adjustAlpha(textClr, 0.15) }}>
              LC: {formatValue(centerLine)}
            </span>
          </div>
        )}
      </header>

      <div className="rounded-2xl border p-4" style={{ borderColor: adjustAlpha(cardBg, 0.3), backgroundColor: bg }}>
        <ControlChartSvg chart={chart} width={chartWidth} height={chartHeight} colors={colors} />
      </div>

      {layout === "grafica-tabla" && (
        <table className="mt-6 w-full border-collapse text-sm" style={{ color: textClr }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${adjustAlpha(textClr, 0.2)}` }}>
              <th className="py-2 pr-3 text-left text-xs uppercase tracking-wide" style={{ color: adjustAlpha(textClr, 0.5) }}>
                #
              </th>
              <th className="py-2 pr-3 text-left text-xs uppercase tracking-wide" style={{ color: adjustAlpha(textClr, 0.5) }}>
                Etiqueta
              </th>
              <th className="py-2 pr-3 text-left text-xs uppercase tracking-wide" style={{ color: adjustAlpha(textClr, 0.5) }}>
                Valor
              </th>
              <th className="py-2 text-left text-xs uppercase tracking-wide" style={{ color: adjustAlpha(textClr, 0.5) }}>
                Comentario
              </th>
            </tr>
          </thead>
          <tbody>
            {chart.points.map((point, index) => (
              <tr key={point.id} style={{ borderBottom: `1px solid ${adjustAlpha(textClr, 0.08)}` }}>
                <td className="py-1.5 pr-3" style={{ color: adjustAlpha(textClr, 0.5) }}>
                  {index + 1}
                </td>
                <td className="py-1.5 pr-3">{point.label || `Punto ${index + 1}`}</td>
                <td className="py-1.5 pr-3" style={{ color: isPointOutOfControl(point, chart) ? OUT_COLOR : textClr }}>
                  {formatValue(point.value)}
                </td>
                <td className="py-1.5 text-xs" style={{ color: adjustAlpha(textClr, 0.6) }}>
                  {point.comment ?? ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showStats && (
        <div className="mt-6 flex flex-wrap gap-4 rounded-2xl border p-4 text-xs" style={{ borderColor: adjustAlpha(cardBg, 0.3), backgroundColor: cardBg }}>
          {[
            { label: "Promedio", value: formatValue(centerLine) },
            { label: "Minimo", value: formatValue(minValue) },
            { label: "Maximo", value: formatValue(maxValue) },
            { label: "Puntos", value: String(chart.points.length) },
            { label: "Fuera de control", value: String(outCount) },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-[11px] uppercase tracking-wide" style={{ color: adjustAlpha(textClr, 0.5) }}>
                {stat.label}
              </p>
              <p className="text-lg font-semibold" style={{ color: textClr }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <footer className="mt-6 border-t pt-4 text-center text-xs" style={{ borderColor: adjustAlpha(textClr, 0.15), color: adjustAlpha(textClr, 0.5) }}>
        Exportado desde Simple Lean Six Sigma — simple-lss
      </footer>

      {options.watermark.enabled && options.watermark.text && (
        <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center" style={{ opacity: 0.08 }}>
          <p className="rotate-[-25deg] text-7xl font-black whitespace-nowrap" style={{ color: textClr }}>
            {options.watermark.text}
          </p>
        </div>
      )}
    </article>
  );
}
