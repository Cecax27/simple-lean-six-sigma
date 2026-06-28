"use client";

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

  // Flatten the tree for column rendering
  // Left column: needs; Middle: drivers (grouped); Right: requirements (grouped)
  const leftItems: { id: string; label: string; rowSpan: number }[] = [];
  const middleItems: { id: string; label: string; parentNeedId: string; rowSpan: number }[] = [];
  const rightItems: { id: string; label: string; parentDriverId: string }[] = [];

  for (const need of tree.needs) {
    let needRequirementRows = 0;
    for (const driver of need.drivers) {
      const reqCount = driver.requirements.length > 0 ? driver.requirements.length : 1;
      needRequirementRows += reqCount;
      middleItems.push({
        id: driver.id,
        label: driver.label,
        parentNeedId: need.id,
        rowSpan: reqCount,
      });
      for (const req of driver.requirements) {
        rightItems.push({
          id: req.id,
          label: req.label,
          parentDriverId: driver.id,
        });
      }
      if (driver.requirements.length === 0) {
        rightItems.push({ id: `empty-${driver.id}`, label: "", parentDriverId: driver.id });
      }
    }
    leftItems.push({
      id: need.id,
      label: need.label,
      rowSpan: needRequirementRows > 0 ? needRequirementRows : 1,
    });
    if (need.drivers.length === 0) {
      middleItems.push({ id: `empty-${need.id}`, label: "", parentNeedId: need.id, rowSpan: 1 });
      rightItems.push({ id: `empty2-${need.id}`, label: "", parentDriverId: `empty-${need.id}` });
    }
  }

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
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: headerBg,
            padding: 20,
            borderBottom: `1px solid ${rgba(cardBg, 0.3)}`,
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
                top: 52,
                right: 52,
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

        {/* Body: 3-column tree grid */}
        <div
          style={{
            display: "flex",
            gap: 16,
            padding: 20,
            minHeight: 200,
          }}
        >
          {/* Column 1: Necesidades */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>Necesidades</div>
            <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>Criticas del cliente</div>
            {!isFlat && <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />}
            {leftItems.length === 0 ? (
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: mutedClr,
                  border: `1px dashed ${rgba(cardBg, 0.5)}`,
                }}
              >
                Sin necesidades
              </div>
            ) : (
              leftItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: accentBg,
                    borderRadius: isFlat ? 0 : 16,
                    padding: "8px 12px",
                    fontWeight: 600,
                    color: textClr,
                    border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                    borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                    minHeight: 36,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.label}
                </div>
              ))
            )}
          </div>

          {/* Column 2: Impulsores */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>Impulsores</div>
            <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>Punto de transicion</div>
            {!isFlat && <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />}
            {middleItems.length === 0 ? (
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: mutedClr,
                  border: `1px dashed ${rgba(cardBg, 0.5)}`,
                }}
              >
                Sin impulsores
              </div>
            ) : (
              middleItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: accentBg,
                    borderRadius: isFlat ? 0 : 16,
                    padding: "8px 12px",
                    color: item.label ? textClr : mutedClr,
                    border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                    borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                    minHeight: 36,
                    display: "flex",
                    alignItems: "center",
                    fontStyle: item.label ? "normal" : "italic",
                  }}
                >
                  {item.label || "Sin impulsor"}
                </div>
              ))
            )}
          </div>

          {/* Column 3: Requisitos */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: textClr, marginBottom: 4 }}>Requisitos</div>
            <div style={{ fontSize: 12, color: mutedClr, marginBottom: 8 }}>Caracteristicas medibles</div>
            {!isFlat && <div style={{ borderBottom: `1px solid ${rgba(cardBg, 0.3)}`, marginBottom: 8 }} />}
            {rightItems.length === 0 ? (
              <div
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: mutedClr,
                  border: `1px dashed ${rgba(cardBg, 0.5)}`,
                }}
              >
                Sin requisitos
              </div>
            ) : (
              rightItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: isFlat ? 0 : 8,
                    padding: "8px 12px",
                    color: item.label ? textClr : mutedClr,
                    border: isFlat ? undefined : `1px solid ${rgba(cardBg, 0.3)}`,
                    borderBottom: isFlat ? `1px solid ${rgba(cardBg, 0.3)}` : undefined,
                    minHeight: 36,
                    display: "flex",
                    alignItems: "center",
                    fontStyle: item.label ? "normal" : "italic",
                  }}
                >
                  {item.label || "Sin requisito"}
                </div>
              ))
            )}
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
