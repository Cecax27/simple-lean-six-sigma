"use client";

import { useMemo, type CSSProperties, type ReactNode } from "react";
import type { CTQTree } from "@/tools/ctq/types";
import type { ExportOptions } from "@/lib/export/types";

interface ExportTreeProps {
  tree: CTQTree;
  options: ExportOptions;
}

function hexBrightness(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface RenderedNeed {
  needId: string;
  needLabel: string;
  needTop: number;
  needHeight: number;
  drivers: RenderedDriver[];
  connectorNeeds: { fromY: number; toY: number }[];
}

interface RenderedDriver {
  driverId: string;
  driverLabel: string;
  driverTop: number;
  driverHeight: number;
  requirements: RenderedRequirement[];
}

interface RenderedRequirement {
  reqId: string;
  reqLabel: string;
  reqTop: number;
  reqHeight: number;
}

const ITEM_H = 36;
const ITEM_GAP = 8;
const COL_W = 220;
const COL_GAP = 48; // gap between columns, room for arrows
const BODY_PADDING = 20;

const CARD_FONT_SIZE = 13;
const CARD_LINE_HEIGHT = Math.round(CARD_FONT_SIZE * 1.35);
const CARD_PAD_X = 12;
const CARD_PAD_Y = 8;

function estimateLines(label: string, width: number): number {
  if (!label) return 1;
  const innerW = width - 2 * CARD_PAD_X;
  const charsPerLine = Math.max(8, Math.floor(innerW / (CARD_FONT_SIZE * 0.55)));
  const words = label.split(/\s+/);
  let lines = 1;
  let current = 0;
  for (const word of words) {
    const add = word.length + (current > 0 ? 1 : 0);
    if (current + add > charsPerLine && current > 0) {
      lines += 1;
      current = word.length;
    } else {
      current += add;
    }
  }
  return Math.max(1, lines);
}

function cardHeight(label: string, width: number): number {
  const lines = estimateLines(label, width);
  return Math.max(ITEM_H, lines * CARD_LINE_HEIGHT + 2 * CARD_PAD_Y);
}

function computeLayout(tree: CTQTree): {
  needs: RenderedNeed[];
  totalHeight: number;
} {
  const renderedNeeds: RenderedNeed[] = [];
  let y = 0;

  for (const need of tree.needs) {
    const drivers =
      need.drivers.length > 0
        ? need.drivers
        : [
            {
              id: `__empty__${need.id}`,
              label: "",
              requirements: [],
            } as unknown as (typeof need.drivers)[number],
          ];

    const renderedDrivers: RenderedDriver[] = [];
    let needDriverY = 0;

    for (const driver of drivers) {
      const driverReqs = driver.requirements as { id: string; label: string }[];
      const reqs =
        driverReqs.length > 0
          ? driverReqs
          : [{ id: `__empty__${driver.id}`, label: "" }];

      const renderedReqs: RenderedRequirement[] = [];
      let reqY = 0;

      for (const req of reqs) {
        const reqHeight = cardHeight(req.label, COL_W);
        renderedReqs.push({
          reqId: req.id,
          reqLabel: req.label,
          reqTop: reqY,
          reqHeight,
        });
        reqY += reqHeight + ITEM_GAP;
      }

      const reqBlockH = reqY - ITEM_GAP;
      const driverHeight = Math.max(
        cardHeight(driver.label, COL_W),
        reqBlockH,
      );
      const reqCentering = (driverHeight - reqBlockH) / 2;

      for (const r of renderedReqs) {
        r.reqTop += reqCentering;
      }

      const driverTop = needDriverY;
      needDriverY += driverHeight + ITEM_GAP;

      renderedDrivers.push({
        driverId: driver.id,
        driverLabel: driver.label || "",
        driverTop,
        driverHeight,
        requirements: renderedReqs,
      });
    }

    const driversBlockH = needDriverY - ITEM_GAP;
    const needHeight = Math.max(
      cardHeight(need.label, COL_W),
      driversBlockH,
    );
    const driverCentering = (needHeight - driversBlockH) / 2;

    for (const d of renderedDrivers) {
      d.driverTop += driverCentering;
    }

    const needCenterY = needHeight / 2;

    const connectorNeeds: { fromY: number; toY: number }[] = [];
    for (const driver of renderedDrivers) {
      const driverCenterY = driver.driverTop + driver.driverHeight / 2;
      connectorNeeds.push({ fromY: needCenterY, toY: driverCenterY });
    }

    renderedNeeds.push({
      needId: need.id,
      needLabel: need.label,
      needTop: y,
      needHeight,
      drivers: renderedDrivers,
      connectorNeeds,
    });

    y += needHeight + ITEM_GAP;
  }

  if (tree.needs.length === 0) {
    renderedNeeds.push({
      needId: "__empty__",
      needLabel: "",
      needTop: 0,
      needHeight: ITEM_H,
      drivers: [
        {
          driverId: "__empty__",
          driverLabel: "",
          driverTop: 0,
          driverHeight: ITEM_H,
          requirements: [{ reqId: "__empty__", reqLabel: "", reqTop: 0, reqHeight: ITEM_H }],
        },
      ],
      connectorNeeds: [],
    });
    y = ITEM_H;
  }

  return { needs: renderedNeeds, totalHeight: Math.max(y - ITEM_GAP, 200) };
}

export function ExportTree({ tree, options }: ExportTreeProps) {
  const {
    colors,
    layout,
    watermark,
    fields,
    size,
  } = options;

  const isFlat = layout === "flat";
  const headerBg = colors.header;
  const cardBg = colors.card;
  const accentBg = colors.accent;
  const textClr = colors.text;
  const bgClr = colors.background;
  const mutedClr =
    hexBrightness(headerBg) < 128
      ? "rgba(250,250,250,0.6)"
      : "rgba(24,24,27,0.55)";

  const showTitle = fields.includes("title");
  const showDate = fields.includes("date");

  const width = size.unit === "cm" ? `${size.value}cm` : `${size.value}px`;

  const layoutData = useMemo(() => computeLayout(tree), [tree]);

  // Tree body container dimensions (single coordinate system)
  const treeBodyWidth = 3 * COL_W + 2 * COL_GAP;
  const treeBodyHeight = layoutData.totalHeight;

  // Column x-edges within the tree body container
  const leftColRightEdge = COL_W;
  const midColLeftEdge = COL_W + COL_GAP;
  const midColRightEdge = 2 * COL_W + COL_GAP;
  const rightColLeftEdge = 2 * (COL_W + COL_GAP);

  const cardBaseStyle: CSSProperties = {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    padding: `${CARD_PAD_Y}px ${CARD_PAD_X}px`,
    fontSize: CARD_FONT_SIZE,
    lineHeight: `${CARD_LINE_HEIGHT}px`,
    color: textClr,
    overflow: "hidden",
    whiteSpace: "normal",
    wordBreak: "break-word",
  };

  return (
    <div
      style={{
        width,
        backgroundColor: bgClr,
        color: textClr,
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 14,
        lineHeight: 1.35,
        padding: 32,
        position: "relative",
      }}
    >
      {/* Main card */}
      <div
        style={{
          border: `1px solid ${rgba(cardBg, 0.3)}`,
          borderRadius: 24,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: headerBg,
            padding: 20,
            borderBottom: `1px solid ${rgba(cardBg, 0.3)}`,
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: mutedClr,
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            ARBOL CTQ
          </div>
          {showTitle && (
            <div style={{ fontSize: 30, fontWeight: 700, color: textClr, marginBottom: 8 }}>
              {tree.title || "Sin titulo"}
            </div>
          )}
          <div style={{ fontSize: 12, color: mutedClr }}>
            {tree.needs.length} necesidad{tree.needs.length !== 1 ? "es" : ""}
          </div>
          {showDate && (
            <div
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: cardBg,
                borderRadius: 12,
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: 500,
                color: mutedClr,
                lineHeight: 1.5,
              }}
            >
              <div style={{ fontWeight: 600 }}>Exportado</div>
              <div>
                {new Intl.DateTimeFormat("es-MX", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date())}
              </div>
            </div>
          )}
        </div>

        {/* Column headers */}
        <div
          style={{
            display: "flex",
            padding: `${BODY_PADDING}px ${BODY_PADDING}px 0 ${BODY_PADDING}px`,
            gap: COL_GAP,
          }}
        >
          <div style={{ width: COL_W, flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>
              Necesidades
            </div>
            <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>
              Criticas del cliente
            </div>
            {!isFlat && (
              <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />
            )}
          </div>
          <div style={{ width: COL_W, flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>
              Impulsores
            </div>
            <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>
              Punto de transicion
            </div>
            {!isFlat && (
              <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />
            )}
          </div>
          <div style={{ width: COL_W, flexShrink: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>
              Requisitos
            </div>
            <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>
              Caracteristicas medibles
            </div>
            {!isFlat && (
              <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />
            )}
          </div>
        </div>

        {/* Tree body — single relative container, all children use absolute positioning */}
        <div
          style={{
            position: "relative",
            width: treeBodyWidth,
            height: treeBodyHeight,
            margin: `0 ${BODY_PADDING}px ${BODY_PADDING}px ${BODY_PADDING}px`,
          }}
        >
          {/* Need cards (column 1) */}
          {layoutData.needs.map((need) =>
            need.needLabel ? (
              <div
                key={need.needId}
                style={{
                  ...cardBaseStyle,
                  position: "absolute",
                  left: 0,
                  top: need.needTop,
                  width: COL_W,
                  height: need.needHeight,
                  backgroundColor: cardBg,
                  borderRadius: isFlat ? 0 : 16,
                  fontWeight: 600,
                  border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                  borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                }}
              >
                {need.needLabel}
              </div>
            ) : null,
          )}
          {layoutData.needs.every((n) => !n.needLabel) && (
            <div
              style={{
                ...cardBaseStyle,
                position: "absolute",
                left: 0,
                top: 0,
                width: COL_W,
                height: ITEM_H,
                backgroundColor: cardBg,
                borderRadius: 8,
                color: mutedClr,
                border: `1px dashed ${rgba(cardBg, 0.5)}`,
                fontSize: 12,
                fontStyle: "italic",
                justifyContent: "center",
              }}
            >
              Sin necesidades
            </div>
          )}

          {/* Driver cards (column 2) */}
          {layoutData.needs.map((need) =>
            need.drivers.map((driver) =>
              driver.driverLabel ? (
                <div
                  key={driver.driverId}
                  style={{
                    ...cardBaseStyle,
                    position: "absolute",
                    left: midColLeftEdge,
                    top: need.needTop + driver.driverTop,
                    width: COL_W,
                    height: driver.driverHeight,
                    backgroundColor: cardBg,
                    borderRadius: isFlat ? 0 : 16,
                    border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                    borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                  }}
                >
                  {driver.driverLabel}
                </div>
              ) : null,
            ),
          )}
          {layoutData.needs.every((n) => n.drivers.every((d) => !d.driverLabel)) && (
            <div
              style={{
                ...cardBaseStyle,
                position: "absolute",
                left: midColLeftEdge,
                top: 0,
                width: COL_W,
                height: ITEM_H,
                backgroundColor: cardBg,
                borderRadius: 8,
                color: mutedClr,
                border: `1px dashed ${rgba(cardBg, 0.5)}`,
                fontSize: 12,
                fontStyle: "italic",
                justifyContent: "center",
              }}
            >
              Sin impulsores
            </div>
          )}

          {/* Requirement cards (column 3) */}
          {layoutData.needs.map((need) =>
            need.drivers.map((driver) =>
              driver.requirements.map((req) =>
                req.reqLabel ? (
                  <div
                    key={req.reqId}
                    style={{
                      ...cardBaseStyle,
                      position: "absolute",
                      left: rightColLeftEdge,
                      top: need.needTop + driver.driverTop + req.reqTop,
                      width: COL_W,
                      height: req.reqHeight,
                      backgroundColor: cardBg,
                      borderRadius: isFlat ? 0 : 8,
                      border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                      borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                    }}
                  >
                    {req.reqLabel}
                  </div>
                ) : null,
              ),
            ),
          )}
          {layoutData.needs.every((n) =>
            n.drivers.every((d) => d.requirements.every((r) => !r.reqLabel)),
          ) && (
            <div
              style={{
                ...cardBaseStyle,
                position: "absolute",
                left: rightColLeftEdge,
                top: 0,
                width: COL_W,
                height: ITEM_H,
                backgroundColor: cardBg,
                borderRadius: 8,
                color: mutedClr,
                border: `1px dashed ${rgba(cardBg, 0.5)}`,
                fontSize: 12,
                fontStyle: "italic",
                justifyContent: "center",
              }}
            >
              Sin requisitos
            </div>
          )}

          {/* SVG connector lines overlay with arrowheads */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={treeBodyWidth}
            height={treeBodyHeight}
            viewBox={`0 0 ${treeBodyWidth} ${treeBodyHeight}`}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
            }}
          >
            <defs>
              <marker
                id="ctq-arrow-need-driver"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={rgba(accentBg, 0.7)} />
              </marker>
              <marker
                id="ctq-arrow-driver-req"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={rgba(accentBg, 0.7)} />
              </marker>
            </defs>
            {layoutData.needs.map((need) =>
              need.drivers.map((driver) => {
                const needCenterY = need.needTop + need.needHeight / 2;
                const driverCenterY =
                  need.needTop + driver.driverTop + driver.driverHeight / 2;
                const lines: ReactNode[] = [];

                // Need → Driver connector (only if both have labels)
                if (need.needLabel && driver.driverLabel) {
                  lines.push(
                    <line
                      key={`nd-${driver.driverId}`}
                      x1={leftColRightEdge}
                      y1={needCenterY}
                      x2={midColLeftEdge}
                      y2={driverCenterY}
                      stroke={rgba(accentBg, 0.7)}
                      strokeWidth={1.5}
                      markerEnd="url(#ctq-arrow-need-driver)"
                    />,
                  );
                }

                // Driver → Requirement connectors (only if both have labels)
                for (const req of driver.requirements) {
                  if (!driver.driverLabel || !req.reqLabel) continue;
                  const reqCenterY =
                    need.needTop + driver.driverTop + req.reqTop + req.reqHeight / 2;
                  lines.push(
                    <line
                      key={`dr-${req.reqId}`}
                      x1={midColRightEdge}
                      y1={driverCenterY}
                      x2={rightColLeftEdge}
                      y2={reqCenterY}
                      stroke={rgba(accentBg, 0.7)}
                      strokeWidth={1.5}
                      markerEnd="url(#ctq-arrow-driver-req)"
                    />,
                  );
                }

                return (
                  <g key={`group-${driver.driverId}`}>
                    {lines}
                  </g>
                );
              }),
            )}
          </svg>
        </div>
      </div>

      {/* Watermark */}
      {watermark.enabled && watermark.text && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 900,
              color: textClr,
              opacity: 0.08,
              transform: "rotate(-25deg)",
            }}
          >
            {watermark.text}
          </span>
        </div>
      )}
    </div>
  );
}