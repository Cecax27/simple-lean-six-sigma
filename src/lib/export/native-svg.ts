import type { SIPOCDiagram, SIPOCItem, SIPOCProcess } from "@/tools/sipoc/types";
import type { ExportOptions } from "@/lib/export/types";

// ── Layout constants (mirror Tailwind classes from ExportDiagram) ──────

const PAD = 32; // p-8
const COL_GAP = 16; // gap-4
const HEADER_MB = 24; // mb-6
const HEADER_PAD = 20; // p-5
const HEADER_RADIUS = 16; // rounded-2xl
const CARD_PAD = 16; // p-4
const CARD_RADIUS = 16; // rounded-2xl (column accent box)
const CARD_HDR_PB = 8; // pb-2
const CARD_HDR_MB = 12; // mb-3
const ITEM_RADIUS = 8; // rounded-lg
const ITEM_GAP = 8; // space-y-2
const ITEM_PX = 12; // px-3
const ITEM_PY = 8; // py-2
const ITEM_FONT_SIZE = 14; // text-sm
const COL_TITLE_FONT_SIZE = 18; // text-lg
const COL_SUBTITLE_FONT_SIZE = 12; // text-xs
const HEADER_LABEL_FONT_SIZE = 11; // text-[11px]
const HEADER_TITLE_FONT_SIZE = 30; // text-3xl
const HEADER_TEXT_FONT_SIZE = 14; // text-sm (scope, route)
const DATE_LABEL_FONT_SIZE = 11;
const DATE_TEXT_FONT_SIZE = 14;
const DATE_PAD_X = 12; // px-3
const DATE_PAD_Y = 8; // py-2
const DATE_RADIUS = 12; // rounded-xl
const BADGE_FONT_SIZE = 11;
const BADGE_PAD_X = 8; // px-2
const BADGE_PAD_Y = 2; // py-0.5
const BADGE_MT = 4; // mt-1
const WATERMARK_FONT_SIZE = 72; // text-7xl
const WATERMARK_OPACITY = 0.08;
const WATERMARK_ANGLE = -25;

const FONT_FAMILY = "system-ui, -apple-system, sans-serif";

// ── Color helpers ──────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
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
  return brightness(baseColor) < 128
    ? "rgba(24,24,27,0.5)"
    : "rgba(250,250,250,0.6)";
}

// ── Text measurement via Canvas ────────────────────────────────────────

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

function measureText(
  text: string,
  fontSize: number,
  fontWeight = "normal",
): number {
  const ctx = getCtx();
  if (!ctx) return text.length * fontSize * 0.6; // fallback
  ctx.font = fontStr(fontSize, fontWeight);
  return ctx.measureText(text).width;
}

function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight = "normal",
): string[] {
  if (!text) return [""];
  const ctx = getCtx();
  if (!ctx) return [text]; // no canvas, no wrap

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

// ── Layout helpers ─────────────────────────────────────────────────────

/** Approximate visual height occupied by a text line */
function lineHeight(fontSize: number): number {
  return Math.round(fontSize * 1.35);
}

/** Baseline y from visual top for a given font size */
function baselineY(topY: number, fontSize: number): number {
  return topY + Math.round(fontSize * 0.8);
}

interface Layout {
  width: number;
  height: number;
  contentWidth: number;
  colWidth: number;
  colContentWidth: number; // inside column padding
  headerTop: number;
  bodyTop: number;
  bodyHeight: number;
  colHeights: number[];
}

function computeLayout(
  diagram: SIPOCDiagram,
  pathLabels: string[],
  options: ExportOptions,
): Layout {
  const width =
    options.size.unit === "cm"
      ? Math.round(options.size.value * 37.795)
      : options.size.value;

  const contentWidth = width - 2 * PAD;
  const colWidth = Math.floor((contentWidth - 4 * COL_GAP) / 5);
  const colContentWidth = colWidth - 2 * CARD_PAD;

  // Header height
  let headerTextHeight = 0;
  headerTextHeight += lineHeight(HEADER_LABEL_FONT_SIZE); // "Diagrama SIPOC"
  const showTitle = options.fields.includes("title");
  const showScope = options.fields.includes("scope");
  const showDate = options.fields.includes("date");

  if (showTitle) {
    headerTextHeight += 4 + lineHeight(HEADER_TITLE_FONT_SIZE); // mt-1 + title
  }
  const scopeText = [diagram.processStart, diagram.processEnd]
    .filter(Boolean)
    .join(" → ");
  if (showScope && scopeText) {
    headerTextHeight += 8 + lineHeight(HEADER_TEXT_FONT_SIZE); // mt-2 + scope
  }
  // Route always shown
  headerTextHeight += 8 + lineHeight(HEADER_TEXT_FONT_SIZE);

  // Date box
  let dateBoxHeight = 0;
  if (showDate) {
    dateBoxHeight =
      2 * DATE_PAD_Y +
      lineHeight(DATE_LABEL_FONT_SIZE) +
      4 +
      lineHeight(DATE_TEXT_FONT_SIZE);
  }

  const headerInnerHeight = Math.max(headerTextHeight, dateBoxHeight);
  const headerHeight = headerInnerHeight + 2 * HEADER_PAD;

  // Column heights
  const sections: SIPOCItem[][] = [
    diagram.suppliers,
    diagram.inputs,
    [], // processes handled separately
    diagram.outputs,
    diagram.customers,
  ];

  const processes = diagram.processes;

  const normalItemHeight =
    2 * ITEM_PY + lineHeight(ITEM_FONT_SIZE);
  const processItemHeight = normalItemHeight + BADGE_MT + (2 * BADGE_PAD_Y + lineHeight(BADGE_FONT_SIZE));
  const sinElementosHeight = normalItemHeight;
  const columnHeaderContentHeight =
    lineHeight(COL_TITLE_FONT_SIZE) +
    lineHeight(COL_SUBTITLE_FONT_SIZE) +
    CARD_HDR_PB +
    CARD_HDR_MB +
    1; // 1px separator line

  const colHeights: number[] = [];

  for (let i = 0; i < 5; i++) {
    let itemsHeight: number;
    if (i === 2) {
      // Process column
      if (processes.length === 0) {
        itemsHeight = sinElementosHeight;
      } else {
        itemsHeight = 0;
        for (let j = 0; j < processes.length; j++) {
          const h = processes[j].child
            ? processItemHeight
            : normalItemHeight;
          itemsHeight += j > 0 ? ITEM_GAP + h : h;
        }
      }
    } else {
      const items = sections[i];
      if (items.length === 0) {
        itemsHeight = sinElementosHeight;
      } else {
        itemsHeight = 0;
        for (let j = 0; j < items.length; j++) {
          itemsHeight += j > 0 ? ITEM_GAP + normalItemHeight : normalItemHeight;
        }
      }
    }
    colHeights.push(2 * CARD_PAD + columnHeaderContentHeight + itemsHeight);
  }

  const bodyHeight = Math.max(...colHeights);
  const bodyTop = PAD + headerHeight + HEADER_MB;
  const height = bodyTop + bodyHeight + PAD;

  return {
    width,
    height,
    contentWidth,
    colWidth,
    colContentWidth,
    headerTop: PAD,
    bodyTop,
    bodyHeight,
    colHeights,
  };
}

// ── SVG element builders ───────────────────────────────────────────────

function attrs(attributes: Record<string, string | number | undefined>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) continue;
    parts.push(`${key}="${String(value).replace(/"/g, "&quot;")}"`);
  }
  return parts.join(" ");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rectElement(
  x: number,
  y: number,
  w: number,
  h: number,
  rx?: number,
  ry?: number,
  extra: Record<string, string | number | undefined> = {},
): string {
  return `<rect ${attrs({ x, y, width: w, height: h, rx, ry, ...extra })} />`;
}

function textElement(
  x: number,
  y: number,
  fontSize: number,
  content: string,
  extra: Record<string, string | number | undefined> = {},
): string {
  return `<text ${attrs({
    x,
    y,
    "font-family": FONT_FAMILY,
    "font-size": fontSize,
    ...extra,
  })}>${escapeXml(content)}</text>`;
}

function buildHeader(
  diagram: SIPOCDiagram,
  pathLabels: string[],
  options: ExportOptions,
  la: Layout,
): string {
  const parts: string[] = [];
  const headerBg = options.colors.header;
  const cardBg = options.colors.card;
  const textClr = options.colors.text;

  const x = PAD;
  const y = la.headerTop;
  const w = la.contentWidth;
  const innerH = la.bodyTop - la.headerTop - HEADER_MB;
  const { borderRadius } = getBorderStyles(options.layout);

  // Header background
  parts.push(
    rectElement(x, y, w, innerH, borderRadius, borderRadius, {
      fill: headerBg,
      stroke: rgbaStr(cardBg, 0.3),
    }),
  );

  // Left text block
  let textY = y + HEADER_PAD;
  const textX = x + HEADER_PAD;

  // "Diagrama SIPOC" label
  parts.push(
    textElement(textX, baselineY(textY, HEADER_LABEL_FONT_SIZE), HEADER_LABEL_FONT_SIZE, "DIAGRAMA SIPOC", {
      fill: adjustTextLight(textClr),
      "font-weight": "600",
    }),
  );
  textY += lineHeight(HEADER_LABEL_FONT_SIZE);

  const showTitle = options.fields.includes("title");
  const showScope = options.fields.includes("scope");
  const showDate = options.fields.includes("date");

  if (showTitle) {
    textY += 4; // mt-1
    const titleWrapped = wrapText(
      diagram.title || "Sin titulo",
      la.contentWidth - 2 * HEADER_PAD - (showDate ? 200 : 0),
      HEADER_TITLE_FONT_SIZE,
      "bold",
    );
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

  const scopeText = [diagram.processStart, diagram.processEnd]
    .filter(Boolean)
    .join(" → ");
  if (showScope && scopeText) {
    textY += 8;
    parts.push(
      textElement(textX, baselineY(textY, HEADER_TEXT_FONT_SIZE), HEADER_TEXT_FONT_SIZE, `Alcance: ${scopeText}`, {
        fill: adjustTextLight(textClr),
      }),
    );
    textY += lineHeight(HEADER_TEXT_FONT_SIZE);
  }

  textY += 8;
  const routeText = pathLabels.join(" > ");
  parts.push(
    textElement(textX, baselineY(textY, HEADER_TEXT_FONT_SIZE), HEADER_TEXT_FONT_SIZE, `Ruta: ${routeText}`, {
      fill: adjustTextLight(textClr),
    }),
  );

  // Date box (right-aligned)
  if (showDate) {
    const dateText = new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());

    // Measure date text to size the box
    const dateLabelWidth = measureText("Exportado", DATE_LABEL_FONT_SIZE, "600");
    const dateValueWidth = measureText(dateText, DATE_TEXT_FONT_SIZE, "500");
    const boxTextWidth = Math.max(dateLabelWidth, dateValueWidth);
    const boxWidth = boxTextWidth + 2 * DATE_PAD_X;
    const boxHeight =
      2 * DATE_PAD_Y +
      lineHeight(DATE_LABEL_FONT_SIZE) +
      4 +
      lineHeight(DATE_TEXT_FONT_SIZE);
    const boxX = x + w - HEADER_PAD - boxWidth;
    const boxY = y + HEADER_PAD;

    parts.push(
      rectElement(boxX, boxY, boxWidth, boxHeight, DATE_RADIUS, DATE_RADIUS, {
        fill: cardBg,
        stroke: rgbaStr(cardBg, 0.3),
      }),
    );

    let dateInnerY = boxY + DATE_PAD_Y;
    parts.push(
      textElement(
        boxX + DATE_PAD_X,
        baselineY(dateInnerY, DATE_LABEL_FONT_SIZE),
        DATE_LABEL_FONT_SIZE,
        "Exportado",
        { fill: adjustTextLight(textClr), "font-weight": "600" },
      ),
    );
    dateInnerY += lineHeight(DATE_LABEL_FONT_SIZE) + 4;

    // Center date text in the box
    const dateTextX = boxX + boxWidth / 2;
    parts.push(
      textElement(
        dateTextX,
        baselineY(dateInnerY, DATE_TEXT_FONT_SIZE),
        DATE_TEXT_FONT_SIZE,
        dateText || "--/--/----, --:--",
        {
          fill: textClr,
          "font-weight": "500",
          "text-anchor": "middle",
        },
      ),
    );
  }

  return parts.join("\n");
}

function getBorderStyles(layout: string) {
  return layout === "flat"
    ? { border: "none" as const, borderRadius: 0 }
    : { border: "full" as const, borderRadius: CARD_RADIUS };
}

function buildColumn(
  title: string,
  subtitle: string,
  items: SIPOCItem[],
  colX: number,
  colY: number,
  colHeight: number,
  colWidth: number,
  colContentWidth: number,
  options: ExportOptions,
): string {
  const parts: string[] = [];
  const cardBg = options.colors.card;
  const accentBg = options.colors.accent;
  const textClr = options.colors.text;
  const isFlat = options.layout === "flat";
  const { borderRadius } = getBorderStyles(options.layout);

  // Column background (accent)
  parts.push(
    rectElement(colX, colY, colWidth, colHeight, borderRadius, borderRadius, {
      fill: accentBg,
      stroke: isFlat ? undefined : rgbaStr(cardBg, 0.3),
    }),
  );

  const innerX = colX + CARD_PAD;
  let innerY = colY + CARD_PAD;

  // Column title
  parts.push(
    textElement(
      innerX,
      baselineY(innerY, COL_TITLE_FONT_SIZE),
      COL_TITLE_FONT_SIZE,
      title,
      { fill: textClr, "font-weight": "600" },
    ),
  );
  innerY += lineHeight(COL_TITLE_FONT_SIZE);

  // Column subtitle
  parts.push(
    textElement(
      innerX,
      baselineY(innerY, COL_SUBTITLE_FONT_SIZE),
      COL_SUBTITLE_FONT_SIZE,
      subtitle,
      { fill: adjustTextLight(textClr) },
    ),
  );
  innerY += lineHeight(COL_SUBTITLE_FONT_SIZE);

  // Separator
  innerY += CARD_HDR_PB;
  if (!isFlat) {
    parts.push(
      `<line ${attrs({
        x1: innerX,
        y1: innerY,
        x2: innerX + colContentWidth,
        y2: innerY,
        stroke: rgbaStr(cardBg, 0.3),
        "stroke-width": 1,
      })} />`,
    );
  }
  innerY += 1 + CARD_HDR_MB;

  // Items
  if (items.length === 0) {
    const itemW = colContentWidth;
    const itemH = 2 * ITEM_PY + lineHeight(ITEM_FONT_SIZE);
    const { border: borderStyle } = getBorderStyles(options.layout);

    parts.push(
      rectElement(innerX, innerY, itemW, itemH, borderStyle === "full" ? ITEM_RADIUS : 0, borderStyle === "full" ? ITEM_RADIUS : 0, {
        fill: cardBg,
        stroke: borderStyle === "full" ? rgbaStr(cardBg, 0.5) : rgbaStr(cardBg, 0.3),
        "stroke-dasharray": borderStyle === "full" ? "4 4" : undefined,
      }),
    );
    parts.push(
      textElement(
        innerX + ITEM_PX,
        baselineY(innerY + ITEM_PY, ITEM_FONT_SIZE),
        ITEM_FONT_SIZE,
        title === "Procesos" ? "Sin procesos" : "Sin elementos",
        { fill: adjustTextLight(textClr) },
      ),
    );
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemW = colContentWidth;
      // Measure and wrap text
      const maxTextWidth = itemW - 2 * ITEM_PX;
      const lines = wrapText(item.label, maxTextWidth, ITEM_FONT_SIZE);
      const textHeight = lines.length * lineHeight(ITEM_FONT_SIZE);
      const itemH = 2 * ITEM_PY + textHeight;

      const itemX = innerX;
      const itemY = innerY + (i > 0 ? ITEM_GAP : 0);
      if (i > 0) innerY += ITEM_GAP;

      const { border: borderStyle, borderRadius: itemRadius } = getBorderStyles(options.layout);

      // Item card background
      parts.push(
        rectElement(itemX, itemY, itemW, itemH, itemRadius, itemRadius, {
          fill: cardBg,
          stroke: borderStyle === "full" ? rgbaStr(cardBg, 0.3) : undefined,
        }),
      );

      // Flat mode: bottom border
      if (borderStyle === "none") {
        parts.push(
          `<line ${attrs({
            x1: itemX,
            y1: itemY + itemH,
            x2: itemX + itemW,
            y2: itemY + itemH,
            stroke: rgbaStr(cardBg, 0.3),
            "stroke-width": 1,
          })} />`,
        );
      }

      // Item text (potentially multi-line)
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

      innerY += itemH;
    }
  }

  return parts.join("\n");
}

function buildProcessColumn(
  processes: SIPOCProcess[],
  colX: number,
  colY: number,
  colHeight: number,
  colWidth: number,
  colContentWidth: number,
  options: ExportOptions,
): string {
  const parts: string[] = [];
  const cardBg = options.colors.card;
  const accentBg = options.colors.accent;
  const textClr = options.colors.text;
  const isFlat = options.layout === "flat";
  const { borderRadius } = getBorderStyles(options.layout);

  // Column background (accent)
  parts.push(
    rectElement(colX, colY, colWidth, colHeight, borderRadius, borderRadius, {
      fill: accentBg,
      stroke: isFlat ? undefined : rgbaStr(cardBg, 0.3),
    }),
  );

  const innerX = colX + CARD_PAD;
  let innerY = colY + CARD_PAD;

  // Column title
  parts.push(
    textElement(
      innerX,
      baselineY(innerY, COL_TITLE_FONT_SIZE),
      COL_TITLE_FONT_SIZE,
      "Proceso",
      { fill: textClr, "font-weight": "600" },
    ),
  );
  innerY += lineHeight(COL_TITLE_FONT_SIZE);

  // Column subtitle
  parts.push(
    textElement(
      innerX,
      baselineY(innerY, COL_SUBTITLE_FONT_SIZE),
      COL_SUBTITLE_FONT_SIZE,
      "Actividades y subprocesos",
      { fill: adjustTextLight(textClr) },
    ),
  );
  innerY += lineHeight(COL_SUBTITLE_FONT_SIZE);

  // Separator
  innerY += CARD_HDR_PB;
  if (!isFlat) {
    parts.push(
      `<line ${attrs({
        x1: innerX,
        y1: innerY,
        x2: innerX + colContentWidth,
        y2: innerY,
        stroke: rgbaStr(cardBg, 0.3),
        "stroke-width": 1,
      })} />`,
    );
  }
  innerY += 1 + CARD_HDR_MB;

  // Process items
  if (processes.length === 0) {
    const itemW = colContentWidth;
    const itemH = 2 * ITEM_PY + lineHeight(ITEM_FONT_SIZE);
    const { border: borderStyle } = getBorderStyles(options.layout);

    parts.push(
      rectElement(innerX, innerY, itemW, itemH, borderStyle === "full" ? ITEM_RADIUS : 0, borderStyle === "full" ? ITEM_RADIUS : 0, {
        fill: cardBg,
        stroke: borderStyle === "full" ? rgbaStr(cardBg, 0.5) : rgbaStr(cardBg, 0.3),
        "stroke-dasharray": borderStyle === "full" ? "4 4" : undefined,
      }),
    );
    parts.push(
      textElement(
        innerX + ITEM_PX,
        baselineY(innerY + ITEM_PY, ITEM_FONT_SIZE),
        ITEM_FONT_SIZE,
        "Sin procesos",
        { fill: adjustTextLight(textClr) },
      ),
    );
  } else {
    for (let i = 0; i < processes.length; i++) {
      const process = processes[i];
      const itemW = colContentWidth;
      const maxTextWidth = itemW - 2 * ITEM_PX;
      const lines = wrapText(process.label, maxTextWidth, ITEM_FONT_SIZE);
      const textHeight = lines.length * lineHeight(ITEM_FONT_SIZE);
      let itemH = 2 * ITEM_PY + textHeight;
      if (process.child) {
        itemH += BADGE_MT + (2 * BADGE_PAD_Y + lineHeight(BADGE_FONT_SIZE));
      }

      const itemX = innerX;
      const itemY = innerY + (i > 0 ? ITEM_GAP : 0);
      if (i > 0) innerY += ITEM_GAP;

      const { border: borderStyle, borderRadius: itemRadius } = getBorderStyles(options.layout);

      // Item card background
      parts.push(
        rectElement(itemX, itemY, itemW, itemH, itemRadius, itemRadius, {
          fill: cardBg,
          stroke: borderStyle === "full" ? rgbaStr(cardBg, 0.3) : undefined,
        }),
      );

      if (borderStyle === "none") {
        parts.push(
          `<line ${attrs({
            x1: itemX,
            y1: itemY + itemH,
            x2: itemX + itemW,
            y2: itemY + itemH,
            stroke: rgbaStr(cardBg, 0.3),
            "stroke-width": 1,
          })} />`,
        );
      }

      // Item label text
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

      // Badge "Con sub-SIPOC"
      if (process.child) {
        const badgeText = "Con sub-SIPOC";
        const badgeFontW = measureText(badgeText, BADGE_FONT_SIZE, "500");
        const badgeW = badgeFontW + 2 * BADGE_PAD_X;
        const badgeH = 2 * BADGE_PAD_Y + lineHeight(BADGE_FONT_SIZE);
        const badgeX = itemX + ITEM_PX;
        const badgeY = itemY + 2 * ITEM_PY + textHeight + BADGE_MT;

        parts.push(
          rectElement(badgeX, badgeY, badgeW, badgeH, badgeH / 2, badgeH / 2, {
            fill: "rgba(249,115,22,0.15)",
          }),
        );
        parts.push(
          textElement(
            badgeX + BADGE_PAD_X,
            baselineY(badgeY + BADGE_PAD_Y, BADGE_FONT_SIZE),
            BADGE_FONT_SIZE,
            badgeText,
            { fill: "#c2410c", "font-weight": "500" },
          ),
        );
      }

      innerY += itemH;
    }
  }

  return parts.join("\n");
}

function buildWatermark(
  text: string,
  width: number,
  height: number,
  textColor: string,
): string {
  return textElement(width / 2, height / 2, WATERMARK_FONT_SIZE, text, {
    fill: textColor,
    "font-weight": "900",
    opacity: WATERMARK_OPACITY,
    "text-anchor": "middle",
    transform: `rotate(${WATERMARK_ANGLE}, ${width / 2}, ${height / 2})`,
  });
}

// ── Main export function ───────────────────────────────────────────────

export function renderSipocToSvg(
  diagram: SIPOCDiagram,
  pathLabels: string[],
  options: ExportOptions,
): string {
  const la = computeLayout(diagram, pathLabels, options);

  const parts: string[] = [];

  // SVG opening
  parts.push(
    `<svg ${attrs({
      xmlns: "http://www.w3.org/2000/svg",
      width: la.width,
      height: la.height,
      viewBox: `0 0 ${la.width} ${la.height}`,
    })}>`,
  );

  // Background
  parts.push(
    `  ${rectElement(0, 0, la.width, la.height, 0, 0, {
      fill: options.colors.background,
    })}`,
  );

  // Main card (the article element with border)
  parts.push(
    `  ${rectElement(PAD, la.headerTop, la.contentWidth, la.height - 2 * PAD, 24, 24, {
      fill: options.colors.background,
      stroke: rgbaStr(options.colors.card, 0.3),
      "stroke-width": 1,
    })}`,
  );

  // Header
  parts.push(`  <!-- Header -->`);
  parts.push("  " + buildHeader(diagram, pathLabels, options, la).replace(/\n/g, "\n  "));

  // Body (5 columns)
  parts.push(`  <!-- Body -->`);
  const columnNames = [
    { title: "Proveedores", subtitle: "Suppliers" },
    { title: "Entradas", subtitle: "Inputs" },
    { title: "Proceso", subtitle: "Actividades" },
    { title: "Salidas", subtitle: "Outputs" },
    { title: "Clientes", subtitle: "Customers" },
  ];

  for (let i = 0; i < 5; i++) {
    const colX = PAD + i * (la.colWidth + COL_GAP);
    const colY = la.bodyTop + (la.bodyHeight - la.colHeights[i]) / 2;

    if (i === 2) {
      const svg = buildProcessColumn(
        diagram.processes,
        colX,
        colY,
        la.colHeights[i],
        la.colWidth,
        la.colContentWidth,
        options,
      );
      parts.push("  " + svg.replace(/\n/g, "\n  "));
    } else {
      const sections: SIPOCItem[][] = [
        diagram.suppliers,
        diagram.inputs,
        diagram.outputs,
        diagram.customers,
      ];
      const idx = i < 2 ? i : i - 1;
      const svg = buildColumn(
        columnNames[i].title,
        columnNames[i].subtitle,
        sections[idx],
        colX,
        colY,
        la.colHeights[i],
        la.colWidth,
        la.colContentWidth,
        options,
      );
      parts.push("  " + svg.replace(/\n/g, "\n  "));
    }
  }

  // Watermark
  if (options.watermark.enabled && options.watermark.text) {
    parts.push(`  <!-- Watermark -->`);
    parts.push(
      "  " +
        buildWatermark(
          options.watermark.text,
          la.width,
          la.height,
          options.colors.text,
        ),
    );
  }

  // SVG closing
  parts.push("</svg>");

  return parts.join("\n") + "\n";
}
