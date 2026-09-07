import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { z } from "zod";

import { createChart, uid } from "@/tools/carta-control/chart";
import type {
  ChartAxes,
  ChartCenterLine,
  ChartLimits,
  ControlChart,
  ControlChartPoint,
  XTickGranularity,
} from "@/tools/carta-control/types";

const pointSchema = z.object({
  "@_id": z.string().optional(),
  "@_label": z.string().optional(),
  "@_value": z.union([z.string(), z.number()]),
  "@_comment": z.string().optional(),
});

const pointsNodeSchema = z.union([
  z.object({ point: z.union([pointSchema, z.array(pointSchema)]).optional() }),
  z.string(),
]);

const limitSchema = z.object({
  "@_enabled": z.union([z.string(), z.boolean()]),
  "@_value": z.union([z.string(), z.number()]),
});

const limitsSchema = z.object({
  upper: limitSchema.optional(),
  lower: limitSchema.optional(),
});

const centerLineSchema = z.object({
  "@_mode": z.enum(["auto", "manual"]),
  "@_value": z.union([z.string(), z.number()]).optional(),
});

const axesSchema = z.object({
  "@_xTickStep": z.union([z.string(), z.number()]).optional(),
  "@_xTickGranularity": z.string().optional(),
  "@_yTickCount": z.union([z.string(), z.number()]).optional(),
  "@_yMin": z.union([z.string(), z.number()]).optional(),
  "@_yMax": z.union([z.string(), z.number()]).optional(),
});

const chartSchema = z.object({
  "@_id": z.string().optional(),
  "@_title": z.string().optional(),
  "@_unit": z.string().optional(),
  limits: limitsSchema.optional(),
  centerLine: centerLineSchema.optional(),
  axes: axesSchema.optional(),
  points: pointsNodeSchema.optional(),
});

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function asBool(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return value === "true";
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function mapPoint(raw: Record<string, unknown>): ControlChartPoint {
  const point: ControlChartPoint = {
    id: raw["@_id"] ? String(raw["@_id"]) : uid("point"),
    label: raw["@_label"] ? String(raw["@_label"]) : "",
    value: asNumber(raw["@_value"], 0),
  };
  if (raw["@_comment"]) {
    point.comment = String(raw["@_comment"]);
  }
  return point;
}

function mapPoints(node: unknown): ControlChartPoint[] {
  if (!node || typeof node === "string") {
    return [];
  }
  const points = (node as { point?: unknown }).point;
  return asArray(points).map((raw) => mapPoint(raw as Record<string, unknown>));
}

function mapLimits(raw: Record<string, unknown> | undefined): ChartLimits {
  const defaults: ChartLimits = {
    upper: { enabled: true, value: 10 },
    lower: { enabled: true, value: 0 },
  };
  if (!raw) {
    return defaults;
  }

  const upper = raw.upper as Record<string, unknown> | undefined;
  const lower = raw.lower as Record<string, unknown> | undefined;

  if (upper) {
    defaults.upper = {
      enabled: asBool(upper["@_enabled"]),
      value: asNumber(upper["@_value"], 10),
    };
  }
  if (lower) {
    defaults.lower = {
      enabled: asBool(lower["@_enabled"]),
      value: asNumber(lower["@_value"], 0),
    };
  }
  return defaults;
}

function mapCenterLine(raw: Record<string, unknown> | undefined): ChartCenterLine {
  if (!raw) {
    return { mode: "auto", value: 0 };
  }
  return {
    mode: raw["@_mode"] === "manual" ? "manual" : "auto",
    value: asNumber(raw["@_value"], 0),
  };
}

function mapAxes(raw: Record<string, unknown> | undefined): ChartAxes {
  const defaults: ChartAxes = {
    xTickStep: 1,
    xTickGranularity: "all",
    yTickCount: 5,
    yMin: null,
    yMax: null,
  };
  if (!raw) {
    return defaults;
  }
  return {
    xTickStep: Math.max(1, Math.round(asNumber(raw["@_xTickStep"], 1))),
    xTickGranularity: mapGranularity(raw["@_xTickGranularity"]),
    yTickCount: Math.max(2, Math.round(asNumber(raw["@_yTickCount"], 5))),
    yMin: raw["@_yMin"] === undefined ? null : asNumber(raw["@_yMin"], 0),
    yMax: raw["@_yMax"] === undefined ? null : asNumber(raw["@_yMax"], 0),
  };
}

function mapGranularity(value: unknown): XTickGranularity {
  if (
    value === "day" ||
    value === "week" ||
    value === "month" ||
    value === "year"
  ) {
    return value;
  }
  return "all";
}

function mapChart(raw: Record<string, unknown>): ControlChart {
  const parsed = chartSchema.parse(raw) as Record<string, unknown>;

  const chart = createChart(String(parsed["@_title"] ?? "Nueva carta de control"));
  if (parsed["@_id"]) {
    chart.id = String(parsed["@_id"]);
  }
  chart.unit = parsed["@_unit"] ? String(parsed["@_unit"]) : "";
  chart.limits = mapLimits(parsed.limits as Record<string, unknown> | undefined);
  chart.centerLine = mapCenterLine(
    parsed.centerLine as Record<string, unknown> | undefined,
  );
  chart.axes = mapAxes(parsed.axes as Record<string, unknown> | undefined);
  chart.points = mapPoints(parsed.points);

  return chart;
}

function limitNode(limit: { enabled: boolean; value: number }): Record<string, unknown> {
  return {
    "@_enabled": String(limit.enabled),
    "@_value": limit.value,
  };
}

function chartNode(chart: ControlChart): Record<string, unknown> {
  const axes: Record<string, unknown> = {
    "@_xTickStep": chart.axes.xTickStep,
    "@_xTickGranularity": chart.axes.xTickGranularity,
    "@_yTickCount": chart.axes.yTickCount,
  };
  if (chart.axes.yMin !== null && chart.axes.yMin !== undefined) {
    axes["@_yMin"] = chart.axes.yMin;
  }
  if (chart.axes.yMax !== null && chart.axes.yMax !== undefined) {
    axes["@_yMax"] = chart.axes.yMax;
  }

  return {
    "@_id": chart.id,
    "@_title": chart.title,
    ...(chart.unit ? { "@_unit": chart.unit } : {}),
    limits: {
      upper: limitNode(chart.limits.upper),
      lower: limitNode(chart.limits.lower),
    },
    centerLine: {
      "@_mode": chart.centerLine.mode,
      "@_value": chart.centerLine.value,
    },
    axes,
    ...(chart.points.length > 0
      ? {
          points: {
            point: chart.points.map((point) => ({
              "@_id": point.id,
              "@_label": point.label,
              "@_value": point.value,
              ...(point.comment ? { "@_comment": point.comment } : {}),
            })),
          },
        }
      : {}),
  };
}

export function serializeToXml(chart: ControlChart): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  return builder.build({
    "carta-control": chartNode(chart),
  });
}

export function parseFromXml(xml: string): ControlChart {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const raw = parser.parse(xml) as {
    "carta-control"?: Record<string, unknown>;
  };

  if (!raw["carta-control"]) {
    throw new Error("El archivo XML no contiene la raiz carta-control.");
  }

  return mapChart(raw["carta-control"]);
}
