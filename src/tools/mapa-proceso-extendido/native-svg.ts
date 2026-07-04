import { jsPDF } from "jspdf";
import type { ExportOptions } from "@/lib/export/types";
import { serializeToCsv } from "@/tools/mapa-proceso-extendido/csv";
import { NODE_SIZES } from "@/tools/mapa-proceso-extendido/layout";
import {
  COLUMN_WIDTH,
  LANE_HEADER_HEIGHT,
  LANE_HEADER_WIDTH,
  ROW_HEIGHT,
} from "@/tools/mapa-proceso-extendido/layout";
import type {
  ActivityType,
  FlowchartData,
  FlowchartEdge,
  FlowchartNode,
  ProcessMap,
} from "@/tools/mapa-proceso-extendido/types";

const PAD = 32;
const FONT = "system-ui, -apple-system, sans-serif";

// ── Color helpers ──────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function rgbaStr(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function escXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── SVG element builders ───────────────────────────────────────────────

function textEl(
  x: number,
  y: number,
  content: string,
  fontSize: number,
  fontWeight: string,
  fill: string,
  anchor: string,
  baseline?: string,
): string {
  const dom = baseline ? ` dominant-baseline="${baseline}"` : "";
  return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fill}" text-anchor="${anchor}" font-family="${FONT}"${dom}>${escXml(content)}</text>`;
}

function drawArrow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
): string {
  const headLen = 8;
  const headW = 6;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return "";

  const ux = dx / len;
  const uy = dy / len;

  const tipX = x2;
  const tipY = y2 - 2; // start a bit inside the target node

  const baseX = tipX - ux * headLen;
  const baseY = tipY - uy * headLen;

  const leftX = baseX - uy * headW;
  const leftY = baseY + ux * headW;
  const rightX = baseX + uy * headW;
  const rightY = baseY - ux * headW;

  return [
    `<line x1="${x1}" y1="${y1}" x2="${tipX}" y2="${tipY}" stroke="${color}" stroke-width="1.5"/>`,
    `<polygon points="${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}" fill="${color}"/>`,
  ].join("\n");
}

function shapeNode(
  x: number,
  y: number,
  type: ActivityType,
  label: string,
  cardFill: string,
  strokeColor: string,
  textColor: string,
): string {
  const size = NODE_SIZES[type];
  const parts: string[] = [];

  switch (type) {
    case "start": {
      const rx = size.height / 2;
      parts.push(
        `<rect x="${x}" y="${y}" width="${size.width}" height="${size.height}" rx="${rx}" ry="${rx}" fill="${cardFill}" stroke="${strokeColor}" stroke-width="2"/>`,
      );
      break;
    }
    case "end": {
      const rx = size.height / 2;
      parts.push(
        `<rect x="${x}" y="${y}" width="${size.width}" height="${size.height}" rx="${rx}" ry="${rx}" fill="${cardFill}" stroke="${strokeColor}" stroke-width="2"/>`,
        `<rect x="${x + 3}" y="${y + 3}" width="${size.width - 6}" height="${size.height - 6}" rx="${rx - 3}" ry="${rx - 3}" fill="none" stroke="${rgbaStr(strokeColor, 0.5)}" stroke-width="1"/>`,
      );
      break;
    }
    case "process":
      parts.push(
        `<rect x="${x}" y="${y}" width="${size.width}" height="${size.height}" rx="8" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>`,
      );
      break;
    case "decision": {
      const cx = x + size.width / 2;
      const cy = y + size.height / 2;
      const hw = size.width / 2 - 2;
      const hh = size.height / 2 - 2;
      parts.push(
        `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${cardFill}" stroke="${strokeColor}" stroke-width="1.5"/>`,
      );
      // adjust text y for diamond (more vertical centering)
      return (
        parts.join("\n") +
        "\n" +
        textEl(
          x + size.width / 2,
          y + size.height / 2,
          label,
          10,
          "normal",
          textColor,
          "middle",
          "middle",
        )
      );
    }
  }

  return (
    parts.join("\n") +
    "\n" +
    textEl(
      x + size.width / 2,
      y + size.height / 2,
      label,
      10,
      "normal",
      textColor,
      "middle",
      "middle",
    )
  );
}

// ── Main render function ───────────────────────────────────────────────

export function renderProcessMapToSvg(
  map: ProcessMap,
  options: ExportOptions,
): string {
  const flowchart = map.flowchart;
  if (!flowchart) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100"><text x="150" y="50" text-anchor="middle" font-family="${FONT}">Sin diagrama</text></svg>`;
  }

  const colors = options.colors;
  const bg = colors.background;
  const text = colors.text;
  const card = colors.card;
  const accent = colors.accent;
  const header = colors.header;

  const deptOrder = flowchart.departmentOrder
    .map((id) => map.departments.find((d) => d.id === id))
    .filter(Boolean) as { id: string; name: string }[];
  const stageOrder = flowchart.stageOrder
    .map((id) => map.stages.find((s) => s.id === id))
    .filter(Boolean) as { id: string; name: string }[];
  const activityMap = new Map(map.activities.map((a) => [a.id, a]));

  const rowYOffset = new Map<string, number>();
  let gridH = LANE_HEADER_HEIGHT;
  for (const stageId of flowchart.stageOrder) {
    rowYOffset.set(stageId, gridH);
    gridH += flowchart.rowHeights?.[stageId] ?? ROW_HEIGHT;
  }
  const gridW = deptOrder.length * COLUMN_WIDTH + LANE_HEADER_WIDTH;

  const showTitle = options.fields.includes("title") && !!map.title;
  const showDate = options.fields.includes("date");
  const showLegend = options.fields.includes("legend");
  const headerH = showTitle || showDate ? 56 : 0;
  const legendH = showLegend ? 36 : 0;

  const svgW = gridW + 2 * PAD;
  const svgH = gridH + headerH + PAD + legendH + PAD;

  const gridX = PAD;
  const gridY = PAD + headerH;

  const lines: string[] = [];

  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}">`,
  );
  lines.push(`<rect width="${svgW}" height="${svgH}" fill="${bg}"/>`);

  if (showTitle) {
    lines.push(
      textEl(PAD + LANE_HEADER_WIDTH + gridW / 2, PAD + 24, map.title, 18, "bold", text, "middle", "middle"),
    );
  }

  if (showDate) {
    const date = new Date().toLocaleDateString("es-ES");
    lines.push(
      textEl(svgW - PAD, PAD + 24, date, 11, "normal", rgbaStr(text, 0.5), "end", "middle"),
    );
  }

  if (options.watermark.enabled && options.watermark.text) {
    const wmX = svgW / 2;
    const wmY = svgH / 2;
    lines.push(
      `<text x="${wmX}" y="${wmY}" font-size="72" font-weight="bold" fill="${rgbaStr(text, 0.08)}" transform="rotate(-25, ${wmX}, ${wmY})" text-anchor="middle" dominant-baseline="central" font-family="${FONT}">${escXml(options.watermark.text)}</text>`,
    );
  }

  // ── Grid backgrounds ──────────────────────────────────────────────────

  stageOrder.forEach((stage, i) => {
    const ry = gridY + (rowYOffset.get(stage.id) ?? 0);
    const rh = flowchart.rowHeights?.[stage.id] ?? ROW_HEIGHT;
    const fill = i % 2 === 0
      ? rgbaStr(accent, 0.15)
      : rgbaStr(accent, 0.05);
    lines.push(
      `<rect x="${gridX}" y="${ry}" width="${gridW}" height="${rh}" fill="${fill}" stroke="${rgbaStr(text, 0.08)}" stroke-width="0.5"/>`,
    );
  });

  // ── Vertical dividers ─────────────────────────────────────────────────

  deptOrder.forEach((_, i) => {
    const cx = gridX + LANE_HEADER_WIDTH + i * COLUMN_WIDTH;
    lines.push(
      `<line x1="${cx}" y1="${gridY}" x2="${cx}" y2="${gridY + gridH}" stroke="${rgbaStr(text, 0.12)}" stroke-width="1"/>`,
    );
  });

  // ── Department headers ────────────────────────────────────────────────

  deptOrder.forEach((dept, i) => {
    const cx = gridX + LANE_HEADER_WIDTH + i * COLUMN_WIDTH;
    lines.push(
      `<rect x="${cx}" y="${gridY}" width="${COLUMN_WIDTH}" height="${LANE_HEADER_HEIGHT}" fill="${header}" stroke="${rgbaStr(text, 0.12)}"/>`,
    );
    lines.push(
      textEl(cx + COLUMN_WIDTH / 2, gridY + LANE_HEADER_HEIGHT / 2, dept.name, 11, "600", text, "middle", "middle"),
    );
  });

  // ── Stage headers ─────────────────────────────────────────────────────

  stageOrder.forEach((stage) => {
    const ry = gridY + (rowYOffset.get(stage.id) ?? 0);
    const rh = flowchart.rowHeights?.[stage.id] ?? ROW_HEIGHT;
    lines.push(
      `<rect x="${gridX}" y="${ry}" width="${LANE_HEADER_WIDTH}" height="${rh}" fill="${header}" stroke="${rgbaStr(text, 0.12)}"/>`,
    );
    lines.push(
      textEl(gridX + LANE_HEADER_WIDTH / 2, ry + rh / 2, stage.name, 11, "600", text, "middle", "middle"),
    );
  });

  // ── Corner ────────────────────────────────────────────────────────────

  lines.push(
    `<rect x="${gridX}" y="${gridY}" width="${LANE_HEADER_WIDTH}" height="${LANE_HEADER_HEIGHT}" fill="${header}" stroke="${rgbaStr(text, 0.12)}"/>`,
  );

  // ── Activity nodes ────────────────────────────────────────────────────

  for (const fn of flowchart.nodes) {
    const act = activityMap.get(fn.id);
    if (!act) continue;

    const nx = gridX + fn.position.x;
    const ny = gridY + fn.position.y;
    const label = act.name || `Act. ${act.id}`;

    lines.push(shapeNode(nx, ny, act.type, label, card, text, text));
  }

  // ── Edges ─────────────────────────────────────────────────────────────

  const nodePositions = new Map(flowchart.nodes.map((n) => [n.id, n]));

  for (const edge of flowchart.edges) {
    const src = nodePositions.get(edge.source);
    const tgt = nodePositions.get(edge.target);
    if (!src || !tgt) continue;

    const srcAct = activityMap.get(edge.source);
    const tgtAct = activityMap.get(edge.target);
    if (!srcAct || !tgtAct) continue;

    const srcSize = NODE_SIZES[srcAct.type];
    const tgtSize = NODE_SIZES[tgtAct.type];

    const sx = gridX + src.position.x + srcSize.width / 2;
    const sy = gridY + src.position.y + srcSize.height;
    const tx = gridX + tgt.position.x + tgtSize.width / 2;
    const ty = gridY + tgt.position.y;

    lines.push(drawArrow(sx, sy, tx, ty, text));

    if (edge.label) {
      const midX = (sx + tx) / 2 + 10;
      const midY = (sy + ty) / 2 - 4;
      lines.push(
        textEl(midX, midY, edge.label, 9, "normal", rgbaStr(text, 0.55), "start", "middle"),
      );
    }
  }

  // ── Legend ────────────────────────────────────────────────────────────

  if (showLegend) {
    const legends: [string, ActivityType][] = [
      ["Inicio", "start"],
      ["Proceso", "process"],
      ["Decisión", "decision"],
      ["Fin", "end"],
    ];

    let lx = PAD + LANE_HEADER_WIDTH;
    const ly = svgH - PAD / 2;

    legends.forEach(([name, type]) => {
      const miniSize = type === "decision" ? { width: 16, height: 12 } : { width: 16, height: 12 };
      const miniX = lx;
      const miniY = ly - miniSize.height / 2;

      if (type === "decision") {
        const cx = miniX + miniSize.width / 2;
        const cy = miniY + miniSize.height / 2;
        const hw = miniSize.width / 2;
        const hh = miniSize.height / 2;
        lines.push(
          `<polygon points="${cx},${cy - hh} ${cx + hw},${cy} ${cx},${cy + hh} ${cx - hw},${cy}" fill="${card}" stroke="${text}" stroke-width="1"/>`,
        );
      } else if (type === "start" || type === "end") {
        const rx = miniSize.height / 2;
        lines.push(
          `<rect x="${miniX}" y="${miniY}" width="${miniSize.width}" height="${miniSize.height}" rx="${rx}" ry="${rx}" fill="${card}" stroke="${text}" stroke-width="1.5"/>`,
        );
      } else {
        lines.push(
          `<rect x="${miniX}" y="${miniY}" width="${miniSize.width}" height="${miniSize.height}" rx="3" fill="${card}" stroke="${text}" stroke-width="1.5"/>`,
        );
      }

      lx += miniSize.width + 4;
      lines.push(
        textEl(lx, ly, name, 9, "normal", rgbaStr(text, 0.7), "start", "middle"),
      );
      lx += 60;
    });
  }

  lines.push("</svg>");
  return lines.join("\n");
}

// ── Export helpers ──────────────────────────────────────────────────────

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function safeName(name: string, fallback = "mapa-proceso"): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized.replace(/[^a-z0-9-_]/g, "") || fallback;
}

export function svgToDataUrl(svgString: string): string {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
}

export async function svgToPngDataUrl(svgString: string, scale = 2): Promise<string> {
  const svgUrl = svgToDataUrl(svgString);
  const img = await loadImage(svgUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth * scale;
  canvas.height = img.naturalHeight * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el contexto del canvas.");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen SVG."));
    img.src = src;
  });
}

export async function exportMapAsSvg(
  map: ProcessMap,
  options: ExportOptions,
  filename?: string,
): Promise<void> {
  const svg = renderProcessMapToSvg(map, options);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(filename ?? `${safeName(map.title)}.svg`, blob);
}

export async function exportMapAsPng(
  map: ProcessMap,
  options: ExportOptions,
  filename?: string,
): Promise<void> {
  const svg = renderProcessMapToSvg(map, options);
  const dataUrl = await svgToPngDataUrl(svg, 2);
  const resp = await fetch(dataUrl);
  const blob = await resp.blob();
  downloadBlob(filename ?? `${safeName(map.title)}.png`, blob);
}

export async function exportMapAsPdf(
  map: ProcessMap,
  options: ExportOptions,
  filename?: string,
): Promise<void> {
  const svg = renderProcessMapToSvg(map, options);
  const pngDataUrl = await svgToPngDataUrl(svg, 2);

  const img = new Image();
  img.src = pngDataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("No se pudo preparar la imagen para PDF."));
  });

  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageRatio = img.width / img.height;
  const pageRatio = pageWidth / pageHeight;

  let renderWidth = pageWidth - 32;
  let renderHeight = renderWidth / imageRatio;
  if (imageRatio < pageRatio) {
    renderHeight = pageHeight - 32;
    renderWidth = renderHeight * imageRatio;
  }
  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(pngDataUrl, "PNG", x, y, renderWidth, renderHeight);
  pdf.save(filename ?? `${safeName(map.title)}.pdf`);
}

export function exportMapAsCsv(map: ProcessMap): void {
  const csv = serializeToCsv(map);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(`${safeName(map.title)}.csv`, blob);
}
