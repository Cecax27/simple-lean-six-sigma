import type { CTQTree } from "@/tools/ctq/types";
import type { ExportOptions } from "@/lib/export/types";

// ── Layout constants ────────────────────────────────────────────────────

const PAD = 32;
const COL_GAP = 16;
const HEADER_MB = 24;
const HEADER_PAD = 20;
const CARD_PAD = 16;
const CARD_HDR_PB = 8;
const CARD_HDR_MB = 12;
const ITEM_RADIUS = 8;
const ITEM_GAP = 8;
const ITEM_PX = 12;
const ITEM_PY = 8;
const ITEM_FONT_SIZE = 14;
const COL_TITLE_FONT_SIZE = 18;
const COL_SUBTITLE_FONT_SIZE = 12;
const HEADER_LABEL_FONT_SIZE = 11;
const HEADER_TITLE_FONT_SIZE = 30;
const HEADER_TEXT_FONT_SIZE = 14;
const DATE_LABEL_FONT_SIZE = 11;
const DATE_TEXT_FONT_SIZE = 14;
const DATE_PAD_X = 12;
const DATE_PAD_Y = 8;
const DATE_RADIUS = 12;
const WATERMARK_FONT_SIZE = 72;
const WATERMARK_OPACITY = 0.08;
const WATERMARK_ANGLE = -25;

const FONT_FAMILY = "system-ui, -apple-system, sans-serif";

// ── Color helpers ───────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
}

function brightness(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function rgbaStr(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function adjustTextLight(baseColor: string): string {
  return brightness(baseColor) < 128 ? "rgba(24,24,27,0.5)" : "rgba(250,250,250,0.6)";
}

// ── Text measurement via Canvas ─────────────────────────────────────────

let _ctx: CanvasRenderingContext2D | null = null;

function getCtx(): CanvasRenderingContext2D | null {
  if (_ctx) return _ctx;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx) _ctx = ctx;
  return ctx;
}

function fontStr(fontSize: number, fontWeight = "normal"): string {
  return `${fontWeight} ${fontSize}px ${FONT_FAMILY}`;
}

function measureText(text: string, fontSize: number, fontWeight = "normal"): number {
  const ctx = getCtx();
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = fontStr(fontSize, fontWeight);
  return ctx.measureText(text).width;
}

function wrapText(text: string, maxWidth: number, fontSize: number, fontWeight = "normal"): string[] {
  if (!text) return [""];
  const ctx = getCtx();
  if (!ctx) return [text];

  ctx.font = fontStr(fontSize, fontWeight);
  const lines: string[] = [];
  const words = text.split(" ");
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function lineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.35);
}

function baselineY(topY: number, fontSize: number): number {
  return topY + Math.round(fontSize * 0.8);
}

// ── SVG element builders ────────────────────────────────────────────────

function attrs(attributes: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) continue;
    parts.push(`${key}="${String(value).replace(/"/g, "&quot;")}"`);
  }
  return parts.join(" ");
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function rectElement(x: number, y: number, w: number, h: number, rx?: number, ry?: number, extra: Record<string, string | number | undefined> = {}): string {
  return `<rect ${attrs({ x, y, width: w, height: h, rx, ry, ...extra })} />`;
}

function textElement(x: number, y: number, fontSize: number, content: string, extra: Record<string, string | number | undefined> = {}): string {
  return `<text ${attrs({ x, y, "font-family": FONT_FAMILY, "font-size": fontSize, ...extra })}>${escapeXml(content)}</text>`;
}

// ── Layout computation ──────────────────────────────────────────────────

interface LayoutItem {
  id: string;
  label: string;
  y: number;
  height: number;
  children?: LayoutItem[];
}

interface LayoutColumn {
  x: number;
  y: number;
  width: number;
  items: LayoutItem[];
}

interface Layout {
  width: number;
  height: number;
  contentWidth: number;
  colWidth: number;
  colContentWidth: number;
  headerTop: number;
  headerHeight: number;
  bodyTop: number;
  bodyHeight: number;
  leftCol: LayoutColumn;
  middleCol: LayoutColumn;
  rightCol: LayoutColumn;
  connectorLines: ConnectorLine[];
}

interface ConnectorLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function computeLayout(tree: CTQTree, options: ExportOptions): Layout {
  const width = options.size.unit === "cm" ? Math.round(options.size.value * 37.795) : options.size.value;
  const contentWidth = width - 2 * PAD;
  const colWidth = Math.floor((contentWidth - 2 * COL_GAP) / 3);
  const colContentWidth = colWidth - 2 * CARD_PAD;

  // Header height
  const showTitle = options.fields.includes("title");
  const showDate = options.fields.includes("date");

  let headerTextH = lineHeight(HEADER_LABEL_FONT_SIZE);
  if (showTitle) {
    headerTextH += 4 + lineHeight(HEADER_TITLE_FONT_SIZE);
  }
  headerTextH += 8 + lineHeight(HEADER_TEXT_FONT_SIZE);

  let dateBoxH = 0;
  if (showDate) {
    dateBoxH = 2 * DATE_PAD_Y + lineHeight(DATE_LABEL_FONT_SIZE) + 4 + lineHeight(DATE_TEXT_FONT_SIZE);
  }

  const headerInnerH = Math.max(headerTextH, dateBoxH);
  const headerHeight = headerInnerH + 2 * HEADER_PAD;

  // Column header heights
  const colHeaderH =
    lineHeight(COL_TITLE_FONT_SIZE) + lineHeight(COL_SUBTITLE_FONT_SIZE) + CARD_HDR_PB + CARD_HDR_MB + 1;

  // The unit row height (one requirement)
  const unitRowH = 2 * ITEM_PY + lineHeight(ITEM_FONT_SIZE);

  // Compute body: needs → drivers → requirements as a flat vertical listing
  // Each requirement-level row has unitRowH + ITEM_GAP
  const rowHeight = unitRowH + ITEM_GAP;

  // Build columns
  const leftCol: LayoutColumn = { x: PAD, y: 0, width: colWidth, items: [] };
  const middleCol: LayoutColumn = { x: PAD + colWidth + COL_GAP, y: 0, width: colWidth, items: [] };
  const rightCol: LayoutColumn = {
    x: PAD + 2 * (colWidth + COL_GAP),
    y: 0,
    width: colWidth,
    items: [],
  };
  const connectorLines: ConnectorLine[] = [];

  let y = 0;

  for (const need of tree.needs) {
    const needDrivers = need.drivers.length > 0 ? need.drivers : [null];
    let needRows = 0;
    const driverItems: { id: string; label: string; height: number; children: { id: string; label: string }[] }[] = [];

    for (const d of needDrivers) {
      if (d === null) {
        needRows += 1;
        driverItems.push({ id: `empty-${need.id}`, label: "", height: unitRowH, children: [] });
        continue;
      }
      const reqs = d.requirements.length > 0 ? d.requirements : [null];
      const driverRows = reqs.length;
      needRows += driverRows;
      const children: { id: string; label: string }[] = reqs.map((r) =>
        r === null ? { id: `empty-${d.id}`, label: "" } : { id: r.id, label: r.label },
      );
      driverItems.push({
        id: d.id,
        label: d.label,
        height: driverRows * rowHeight - ITEM_GAP,
        children,
      });
    }

    const needItemH = needRows * rowHeight - ITEM_GAP;
    const needMidY = y + needItemH / 2;

    if (need.label) {
      leftCol.items.push({ id: need.id, label: need.label, y, height: needItemH });
    }

    // Middle column: drivers
    let driverY = y;
    for (const d of driverItems) {
      const dMidY = driverY + d.height / 2;
      middleCol.items.push({ id: d.id, label: d.label, y: driverY, height: d.height });

      // Connector: need → driver (if both have labels)
      if (need.label && d.label) {
        connectorLines.push({
          x1: leftCol.x + colWidth,
          y1: needMidY,
          x2: middleCol.x,
          y2: dMidY,
        });
      }

      // Right column: requirements
      let reqY = driverY;
      for (const r of d.children) {
        rightCol.items.push({ id: r.id, label: r.label, y: reqY, height: unitRowH });

        // Connector: driver → requirement
        if (d.label && r.label) {
          connectorLines.push({
            x1: middleCol.x + colWidth,
            y1: dMidY,
            x2: rightCol.x,
            y2: reqY + unitRowH / 2,
          });
        }

        reqY += rowHeight;
      }

      driverY += d.height + ITEM_GAP;
    }

    y += needItemH + ITEM_GAP;
  }

  // Handle empty state
  if (tree.needs.length === 0) {
    const emptyH = unitRowH;
    leftCol.items.push({ id: "empty", label: "", y: 0, height: emptyH });
    middleCol.items.push({ id: "empty", label: "", y: 0, height: emptyH });
    rightCol.items.push({ id: "empty", label: "", y: 0, height: emptyH });
    y = emptyH;
  }

  const bodyHeight = Math.max(y - ITEM_GAP, 200); // remove trailing gap, minimum 200
  const bodyTop = PAD + headerHeight + HEADER_MB;
  const totalHeight = bodyTop + bodyHeight + PAD;

  leftCol.y = bodyTop + colHeaderH;
  middleCol.y = bodyTop + colHeaderH;
  rightCol.y = bodyTop + colHeaderH;

  return {
    width: totalHeight > 0 ? width : 800,
    height: totalHeight,
    contentWidth,
    colWidth,
    colContentWidth,
    headerTop: PAD,
    headerHeight,
    bodyTop,
    bodyHeight,
    leftCol,
    middleCol,
    rightCol,
    connectorLines,
  };
}

// ── UI element builders ─────────────────────────────────────────────────

function getBorderStyles(layout: string) {
  return layout === "flat" ? { border: "none" as const, borderRadius: 0 } : { border: "full" as const, borderRadius: ITEM_RADIUS };
}

function buildHeader(tree: CTQTree, la: Layout, colors: ExportOptions["colors"], fields: string[]): string {
  const parts: string[] = [];
  const headerBg = colors.header;
  const cardBg = colors.card;
  const textClr = colors.text;
  const showTitle = fields.includes("title");
  const showDate = fields.includes("date");

  const x = PAD;
  const y = la.headerTop;
  const w = la.contentWidth;
  const innerH = la.headerHeight;

  parts.push(rectElement(x, y, w, innerH, 16, 16, { fill: headerBg, stroke: rgbaStr(cardBg, 0.3) }));

  let textY = y + HEADER_PAD;
  const textX = x + HEADER_PAD;

  parts.push(
    textElement(textX, baselineY(textY, HEADER_LABEL_FONT_SIZE), HEADER_LABEL_FONT_SIZE, "ARBOL CTQ", {
      fill: adjustTextLight(textClr),
      "font-weight": "600",
    }),
  );
  textY += lineHeight(HEADER_LABEL_FONT_SIZE);

  if (showTitle) {
    textY += 4;
    const titleWrapped = wrapText(tree.title || "Sin titulo", la.contentWidth - 2 * HEADER_PAD - 200, HEADER_TITLE_FONT_SIZE, "bold");
    for (const line of titleWrapped) {
      parts.push(
        textElement(textX, baselineY(textY, HEADER_TITLE_FONT_SIZE), HEADER_TITLE_FONT_SIZE, line, {
          fill: textClr,
          "font-weight": "bold",
        }),
      );
      textY += lineHeight(HEADER_TITLE_FONT_SIZE);
    }
  }

  textY += 8;
  parts.push(
    textElement(textX, baselineY(textY, HEADER_TEXT_FONT_SIZE), HEADER_TEXT_FONT_SIZE, `${tree.needs.length} necesidad${tree.needs.length !== 1 ? "es" : ""}`, {
      fill: adjustTextLight(textClr),
    }),
  );

  if (showDate) {
    const dateText = new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    const labelW = measureText("Exportado", DATE_LABEL_FONT_SIZE, "600");
    const dateW = measureText(dateText, DATE_TEXT_FONT_SIZE, "500");
    const boxTextW = Math.max(labelW, dateW);
    const boxW = boxTextW + 2 * DATE_PAD_X;
    const boxH = 2 * DATE_PAD_Y + lineHeight(DATE_LABEL_FONT_SIZE) + 4 + lineHeight(DATE_TEXT_FONT_SIZE);
    const boxX = x + w - HEADER_PAD - boxW;
    const boxY = y + HEADER_PAD;

    parts.push(rectElement(boxX, boxY, boxW, boxH, DATE_RADIUS, DATE_RADIUS, { fill: cardBg, stroke: rgbaStr(cardBg, 0.3) }));

    let dateY = boxY + DATE_PAD_Y;
    parts.push(textElement(boxX + DATE_PAD_X, baselineY(dateY, DATE_LABEL_FONT_SIZE), DATE_LABEL_FONT_SIZE, "Exportado", { fill: adjustTextLight(textClr), "font-weight": "600" }));
    dateY += lineHeight(DATE_LABEL_FONT_SIZE) + 4;
    parts.push(
      textElement(boxX + boxW / 2, baselineY(dateY, DATE_TEXT_FONT_SIZE), DATE_TEXT_FONT_SIZE, dateText || "--/--/----, --:--", {
        fill: textClr,
        "font-weight": "500",
        "text-anchor": "middle",
      }),
    );
  }

  return parts.join("\n");
}

function buildColumn(
  title: string,
  subtitle: string,
  col: LayoutColumn,
  color: string,
  isAccent: boolean,
  cardBg: string,
  textClr: string,
  isFlat: boolean,
  emptyLabel: string,
): string {
  const parts: string[] = [];
  const colX = col.x;
  let colY = col.y - lineHeight(COL_TITLE_FONT_SIZE) - lineHeight(COL_SUBTITLE_FONT_SIZE) - CARD_HDR_PB - CARD_HDR_MB - 1 - CARD_PAD;

  const colItems = col.items;
  let colHeight = 0;
  if (colItems.length > 0) {
    const lastItem = colItems[colItems.length - 1];
    colHeight = lastItem.y + lastItem.height - colItems[0].y;
  }
  const totalColH = CARD_PAD + lineHeight(COL_TITLE_FONT_SIZE) + lineHeight(COL_SUBTITLE_FONT_SIZE) + CARD_HDR_PB + CARD_HDR_MB + 1 + CARD_PAD + colHeight;

  if (!isFlat) {
    parts.push(rectElement(colX, colY, col.width, totalColH, 16, 16, { fill: isAccent ? color : cardBg, stroke: rgbaStr(cardBg, 0.3) }));
  }

  let innerX = colX + CARD_PAD;
  let innerY = colY + CARD_PAD;

  parts.push(textElement(innerX, baselineY(innerY, COL_TITLE_FONT_SIZE), COL_TITLE_FONT_SIZE, title, { fill: textClr, "font-weight": "600" }));
  innerY += lineHeight(COL_TITLE_FONT_SIZE);

  parts.push(textElement(innerX, baselineY(innerY, COL_SUBTITLE_FONT_SIZE), COL_SUBTITLE_FONT_SIZE, subtitle, { fill: adjustTextLight(textClr) }));
  innerY += lineHeight(COL_SUBTITLE_FONT_SIZE);

  innerY += CARD_HDR_PB;
  if (!isFlat) {
    parts.push(`<line ${attrs({ x1: innerX, y1: innerY, x2: innerX + col.width - 2 * CARD_PAD, y2: innerY, stroke: rgbaStr(cardBg, 0.3), "stroke-width": 1 })} />`);
  }
  innerY += 1 + CARD_HDR_MB;

  // Items
  if (isAccent && colItems.length === 1 && !colItems[0].label) {
    // Empty state
    const emptyH = 2 * ITEM_PY + lineHeight(ITEM_FONT_SIZE);
    const emptyY = innerY;
    parts.push(
      rectElement(innerX, emptyY, col.width - 2 * CARD_PAD, emptyH, ITEM_RADIUS, ITEM_RADIUS, {
        fill: cardBg,
        stroke: rgbaStr(cardBg, 0.5),
        "stroke-dasharray": "4 4",
      }),
    );
    parts.push(
      textElement(innerX + ITEM_PX, baselineY(emptyY + ITEM_PY, ITEM_FONT_SIZE), ITEM_FONT_SIZE, emptyLabel, {
        fill: adjustTextLight(textClr),
      }),
    );
  } else {
    for (const item of colItems) {
      if (!item.label) continue; // skip placeholders
      const { border: borderStyle, borderRadius: itemRadius } = getBorderStyles(isFlat ? "flat" : "cards");
      const itemW = col.width - 2 * CARD_PAD;
      const maxTextW = itemW - 2 * ITEM_PX;
      const lines = wrapText(item.label, maxTextW, ITEM_FONT_SIZE);
      const textH = lines.length * lineHeight(ITEM_FONT_SIZE);
      const itemH = 2 * ITEM_PY + textH;
      const itemX = innerX;
      const itemY = innerY + item.y - (colItems[0]?.y ?? 0);

      parts.push(
        rectElement(itemX, itemY, itemW, itemH, itemRadius, itemRadius, {
          fill: cardBg,
          stroke: borderStyle === "full" ? rgbaStr(cardBg, 0.3) : undefined,
        }),
      );

      if (borderStyle === "none") {
        parts.push(`<line ${attrs({ x1: itemX, y1: itemY + itemH, x2: itemX + itemW, y2: itemY + itemH, stroke: rgbaStr(cardBg, 0.3), "stroke-width": 1 })} />`);
      }

      for (let l = 0; l < lines.length; l++) {
        parts.push(
          textElement(
            itemX + ITEM_PX,
            baselineY(itemY + ITEM_PY + l * lineHeight(ITEM_FONT_SIZE), ITEM_FONT_SIZE),
            ITEM_FONT_SIZE,
            lines[l],
            { fill: textClr },
          ),
        );
      }
    }
  }

  return parts.join("\n");
}

// ── Watermark ───────────────────────────────────────────────────────────

function buildWatermark(text: string, width: number, height: number, textColor: string): string {
  return textElement(width / 2, height / 2, WATERMARK_FONT_SIZE, text, {
    fill: textColor,
    "font-weight": "900",
    opacity: WATERMARK_OPACITY,
    "text-anchor": "middle",
    transform: `rotate(${WATERMARK_ANGLE}, ${width / 2}, ${height / 2})`,
  });
}

// ── Main export function ────────────────────────────────────────────────

export function renderCtqToSvg(tree: CTQTree, options: ExportOptions): string {
  const la = computeLayout(tree, options);
  const parts: string[] = [];
  const { colors } = options;
  const cardBg = colors.card;
  const accentBg = colors.accent;
  const textClr = colors.text;
  const isFlat = options.layout === "flat";

  parts.push(`<svg ${attrs({ xmlns: "http://www.w3.org/2000/svg", width: la.width, height: la.height, viewBox: `0 0 ${la.width} ${la.height}` })}>`);

  // Arrowhead marker
  parts.push(`  <defs>`);
  parts.push(
    `    <marker id="ctq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`,
  );
  parts.push(`      <path d="M 0 0 L 10 5 L 0 10 z" fill="${rgbaStr(accentBg, 0.6)}" />`);
  parts.push(`    </marker>`);
  parts.push(`  </defs>`);

  // Background
  parts.push(`  ${rectElement(0, 0, la.width, la.height, 0, 0, { fill: colors.background })}`);

  // Main card border
  parts.push(
    `  ${rectElement(PAD, la.headerTop, la.contentWidth, la.height - 2 * PAD, 24, 24, {
      fill: colors.background,
      stroke: rgbaStr(cardBg, 0.3),
      "stroke-width": 1,
    })}`,
  );

  // Header
  parts.push(`  <!-- Header -->`);
  parts.push("  " + buildHeader(tree, la, colors, options.fields).replace(/\n/g, "\n  "));

  // Connector lines
  parts.push(`  <!-- Connectors -->`);
  for (const line of la.connectorLines) {
    parts.push(
      `  <line ${attrs({ x1: line.x1, y1: line.y1, x2: line.x2, y2: line.y2, stroke: rgbaStr(accentBg, 0.6), "stroke-width": 1.5, "marker-end": "url(#ctq-arrow)" })} />`,
    );
  }

  // Body columns
  parts.push(`  <!-- Body -->`);

  const needsHasContent = la.leftCol.items.some((i) => i.label);
  const driversHasContent = la.middleCol.items.some((i) => i.label);
  const reqsHasContent = la.rightCol.items.some((i) => i.label);

  // Left column: Necesidades
  parts.push(
    "  " +
      buildColumn("Necesidades", "Criticas del cliente", la.leftCol, accentBg, true, cardBg, textClr, isFlat, "Sin necesidades")
        .replace(/\n/g, "\n  "),
  );

  // Middle column: Impulsores
  parts.push(
    "  " +
      buildColumn("Impulsores", "Punto de transicion", la.middleCol, accentBg, needsHasContent && !driversHasContent ? false : true, cardBg, textClr, isFlat, "Sin impulsores")
        .replace(/\n/g, "\n  "),
  );

  // Right column: Requisitos
  parts.push(
    "  " +
      buildColumn("Requisitos", "Caracteristicas medibles", la.rightCol, cardBg, false, cardBg, textClr, isFlat, "Sin requisitos")
        .replace(/\n/g, "\n  "),
  );

  // Watermark
  if (options.watermark.enabled && options.watermark.text) {
    parts.push(`  <!-- Watermark -->`);
    parts.push("  " + buildWatermark(options.watermark.text, la.width, la.height, options.colors.text));
  }

  parts.push("</svg>");
  return parts.join("\n") + "\n";
}
