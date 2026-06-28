"use client";

import { useMemo } from "react";
import type { CTQTree } from "@/tools/ctq/types";
import type { ExportOptions } from "@/lib/export/types";

interface ExportTreeProps {
  tree: CTQTree;
  options: ExportOptions;
}

function adjustTextColor(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128 ? "#18181b" : "#fafafa";
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
  connectorReqs: { fromY: number; toY: number }[];
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

function computeLayout(tree: CTQTree): {
  needs: RenderedNeed[];
  totalHeight: number;
} {
  const renderedNeeds: RenderedNeed[] = [];
  let y = 0;

  for (const need of tree.needs) {
    const drivers = need.drivers.length > 0 ? need.drivers : [{ id: `__empty__${need.id}`, label: "", requirements: [] }] as typeof need.drivers;

    const renderedDrivers: RenderedDriver[] = [];
    let needDriverY = 0;
    const firstDriverReqTops: number[] = [];

    for (const driver of drivers) {
      const reqs = driver.requirements.length > 0
        ? driver.requirements
        : [{ id: `__empty__${driver.id}`, label: "" }] as typeof driver.requirements;

      const renderedReqs: RenderedRequirement[] = [];
      let reqY = 0;

      for (const req of reqs) {
        renderedReqs.push({
          reqId: req.id,
          reqLabel: req.label,
          reqTop: reqY,
          reqHeight: ITEM_H,
        });
        reqY += ITEM_H + ITEM_GAP;
      }

      const driverHeight = Math.max(ITEM_H, reqY - ITEM_GAP);

      // Record connector positions from driver to each req
      const connectorReqs: { fromY: number; toY: number }[] = [];
      const driverCenterY = needDriverY + driverHeight / 2;
      for (let i = 0; i < renderedReqs.length; i++) {
        const reqCenterY = renderedReqs[i].reqTop + ITEM_H / 2;
        connectorReqs.push({ fromY: driverCenterY, toY: reqCenterY });
      }

      if (renderedNeeds.length === 0 && renderedDrivers.length === 0 && renderedReqs.length > 0) {
        firstDriverReqTops.push(0);
      }

      renderedDrivers.push({
        driverId: driver.id,
        driverLabel: driver.label || "",
        driverTop: needDriverY,
        driverHeight,
        requirements: renderedReqs,
        connectorReqs,
      });

      needDriverY += driverHeight + ITEM_GAP;
    }

    const needHeight = Math.max(ITEM_H, needDriverY - ITEM_GAP);
    const needCenterY = needHeight / 2;

    // Build connector positions from need to each driver
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
      drivers: [{
        driverId: "__empty__",
        driverLabel: "",
        driverTop: 0,
        driverHeight: ITEM_H,
        requirements: [{ reqId: "__empty__", reqLabel: "", reqTop: 0, reqHeight: ITEM_H }],
        connectorReqs: [],
      }],
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
  const mutedClr = adjustTextColor(accentBg) === "#18181b"
    ? "rgba(24,24,27,0.5)"
    : "rgba(250,250,250,0.6)";

  const showTitle = fields.includes("title");
  const showDate = fields.includes("date");

  const width = size.unit === "cm" ? `${size.value}cm` : `${size.value}px`;

  const layoutData = useMemo(() => computeLayout(tree), [tree]);

  const bodyPadding = 20;
  const bodyMinH = 200;
  const bodyH = Math.max(bodyMinH, layoutData.totalHeight);
  const headerH = showTitle ? 100 : 60;
  const totalInnerH = headerH + bodyH + 2 * bodyPadding;
  const svgH = totalInnerH;

  // Column positions for SVG connectors
  const leftColRightEdge = bodyPadding + COL_W;
  const midColLeftEdge = bodyPadding + COL_W + COL_GAP;
  const midColRightEdge = midColLeftEdge + COL_W;
  const rightColLeftEdge = midColRightEdge + COL_GAP;

  const connectorOffsetY = headerH + bodyPadding;

  // header height + body padding
  const headerH_actual = showTitle ? 100 : 60;

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
          <div style={{ fontSize: 11, fontWeight: 600, color: mutedClr, textTransform: "uppercase", marginBottom: 4 }}>
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

        {/* Body: horizontal tree with 3 columns */}
        <div style={{ position: "relative", minHeight: bodyH }}>
          {/* Column headers */}
          <div style={{ display: "flex", padding: `${bodyPadding}px ${bodyPadding}px 0 ${bodyPadding}px`, gap: COL_GAP }}>
            <div style={{ width: COL_W, flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>Necesidades</div>
              <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>Criticas del cliente</div>
              {!isFlat && <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />}
            </div>
            <div style={{ width: COL_W, flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>Impulsores</div>
              <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>Punto de transicion</div>
              {!isFlat && <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />}
            </div>
            <div style={{ width: COL_W, flexShrink: 0 }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>Requisitos</div>
              <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>Caracteristicas medibles</div>
              {!isFlat && <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />}
            </div>
          </div>

          {/* Row-based tree body */}
          <div style={{ position: "relative", padding: `0 ${bodyPadding}px ${bodyPadding}px ${bodyPadding}px` }}>
            <div style={{ display: "flex", gap: COL_GAP }}>
              {/* Column 1: Needs */}
              <div style={{ width: COL_W, flexShrink: 0, position: "relative" }}>
                {layoutData.needs.map((need) =>
                  need.needLabel ? (
                    <div
                      key={need.needId}
                      style={{
                        position: "absolute",
                        top: need.needTop,
                        width: "100%",
                        height: need.needHeight,
                        backgroundColor: accentBg,
                        borderRadius: isFlat ? 0 : 16,
                        padding: "8px 12px",
                        fontWeight: 600,
                        color: textClr,
                        border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                        borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                        display: "flex",
                        alignItems: "center",
                        boxSizing: "border-box",
                      }}
                    >
                      {need.needLabel}
                    </div>
                  ) : null,
                )}
                {layoutData.needs.every((n) => !n.needLabel) && (
                  <div
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: mutedClr,
                      border: `1px dashed ${rgba(cardBg, 0.5)}`,
                      fontSize: 12,
                    }}
                  >
                    Sin necesidades
                  </div>
                )}
              </div>

              {/* Column 2: Drivers */}
              <div style={{ width: COL_W, flexShrink: 0, position: "relative" }}>
                {layoutData.needs.map((need) =>
                  need.drivers.map((driver) =>
                    driver.driverLabel ? (
                      <div
                        key={driver.driverId}
                        style={{
                          position: "absolute",
                          top: need.needTop + driver.driverTop,
                          width: "100%",
                          height: driver.driverHeight,
                          backgroundColor: accentBg,
                          borderRadius: isFlat ? 0 : 16,
                          padding: "8px 12px",
                          color: textClr,
                          border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                          borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                          display: "flex",
                          alignItems: "center",
                          fontSize: 14,
                          boxSizing: "border-box",
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
                      backgroundColor: cardBg,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: mutedClr,
                      border: `1px dashed ${rgba(cardBg, 0.5)}`,
                      fontSize: 12,
                    }}
                  >
                    Sin impulsores
                  </div>
                )}
              </div>

              {/* Column 3: Requirements */}
              <div style={{ width: COL_W, flexShrink: 0, position: "relative" }}>
                {layoutData.needs.map((need) =>
                  need.drivers.map((driver) =>
                    driver.requirements.map((req) =>
                      req.reqLabel ? (
                        <div
                          key={req.reqId}
                          style={{
                            position: "absolute",
                            top: need.needTop + driver.driverTop + req.reqTop,
                            width: "100%",
                            height: req.reqHeight,
                            backgroundColor: cardBg,
                            borderRadius: isFlat ? 0 : 8,
                            padding: "8px 12px",
                            color: textClr,
                            border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                            borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                            display: "flex",
                            alignItems: "center",
                            fontSize: 14,
                            boxSizing: "border-box",
                          }}
                        >
                          {req.reqLabel}
                        </div>
                      ) : null,
                    ),
                  ),
                )}
                {layoutData.needs.every((n) => n.drivers.every((d) => d.requirements.every((r) => !r.reqLabel))) && (
                  <div
                    style={{
                      backgroundColor: cardBg,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: mutedClr,
                      border: `1px dashed ${rgba(cardBg, 0.5)}`,
                      fontSize: 12,
                    }}
                  >
                    Sin requisitos
                  </div>
                )}
              </div>
            </div>

            {/* SVG connector lines overlay */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <defs>
                <marker id="arrow-need-driver" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={rgba(accentBg, 0.6)} />
                </marker>
                <marker id="arrow-driver-req" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill={rgba(cardBg, 0.5)} />
                </marker>
              </defs>
              {layoutData.needs.map((need) =>
                need.drivers.map((driver) => {
                  const needCenterY = need.needTop + need.needHeight / 2;
                  const driverCenterY = need.needTop + driver.driverTop + driver.driverHeight / 2;

                  // Need → Driver connector (only if both have labels)
                  const needToDriverLine = (need.needLabel && driver.driverLabel) ? (
                    <line
                      key={`nd-${driver.driverId}`}
                      x1={leftColRightEdge}
                      y1={needCenterY}
                      x2={midColLeftEdge}
                      y2={driverCenterY}
                      stroke={rgba(accentBg, 0.6)}
                      strokeWidth={1.5}
                      markerEnd="url(#arrow-need-driver)"
                    />
                  ) : null;

                  // Driver → Requirement connectors
                  const reqLines = driver.requirements
                    .filter((req) => req.reqLabel && driver.driverLabel)
                    .map((req) => {
                      const reqCenterY = need.needTop + driver.driverTop + req.reqTop + req.reqHeight / 2;
                      return (
                        <line
                          key={`dr-${req.reqId}`}
                          x1={midColRightEdge}
                          y1={driverCenterY}
                          x2={rightColLeftEdge}
                          y2={reqCenterY}
                          stroke={rgba(cardBg, 0.5)}
                          strokeWidth={1.5}
                          markerEnd="url(#arrow-driver-req)"
                        />
                      );
                    });

                  return (
                    <g key={`group-${driver.driverId}`}>
                      {needToDriverLine}
                      {reqLines}
                    </g>
                  );
                }),
              )}
            </svg>
          </div>
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
