import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { z } from "zod";

import type {
  Activity,
  Department,
  FlowchartData,
  FlowchartEdge,
  FlowchartNode,
  ProcessMap,
  Stage,
} from "@/tools/mapa-proceso-extendido/types";

// ── Zod schemas ────────────────────────────────────────────────────────

const departmentSchema = z.object({
  "@_id": z.string(),
  name: z.string(),
});

const departmentsNodeSchema = z.union([
  z.object({ department: z.union([departmentSchema, z.array(departmentSchema)]).optional() }),
  z.string(),
]);

const stageSchema = z.object({
  "@_id": z.string(),
  name: z.string(),
});

const stagesNodeSchema = z.union([
  z.object({ stage: z.union([stageSchema, z.array(stageSchema)]).optional() }),
  z.string(),
]);

const nextIdsNodeSchema = z.union([
  z.object({ id: z.union([z.string(), z.array(z.string())]).optional() }),
  z.string(),
]);

const nextLabelSchema = z.object({
  "@_id": z.string(),
  "#text": z.string(),
});

const nextLabelsNodeSchema = z.union([
  z.object({ label: z.union([nextLabelSchema, z.array(nextLabelSchema)]).optional() }),
  z.string(),
]);

const activitySchema = z.object({
  "@_id": z.string(),
  name: z.string(),
  description: z.string().optional(),
  stageId: z.string(),
  departmentId: z.string(),
  type: z.enum(["start", "process", "decision", "end"]),
  nextIds: nextIdsNodeSchema.optional(),
  nextLabels: nextLabelsNodeSchema.optional(),
});

const activitiesNodeSchema = z.union([
  z.object({ activity: z.union([activitySchema, z.array(activitySchema)]).optional() }),
  z.string(),
]);

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const nodeSchema = z.object({
  "@_id": z.string(),
  position: positionSchema,
});

const flowchartNodesNodeSchema = z.union([
  z.object({ node: z.union([nodeSchema, z.array(nodeSchema)]).optional() }),
  z.string(),
]);

const edgeSchema = z.object({
  "@_id": z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

const flowchartEdgesNodeSchema = z.union([
  z.object({ edge: z.union([edgeSchema, z.array(edgeSchema)]).optional() }),
  z.string(),
]);

const departmentOrderNodeSchema = z.union([
  z.object({ id: z.union([z.string(), z.array(z.string())]).optional() }),
  z.string(),
]);

const stageOrderNodeSchema = z.union([
  z.object({ id: z.union([z.string(), z.array(z.string())]).optional() }),
  z.string(),
]);

const rowHeightSchema = z.object({
  "@_id": z.string(),
  "#text": z.number(),
});

const rowHeightsNodeSchema = z.union([
  z.object({ row: z.union([rowHeightSchema, z.array(rowHeightSchema)]).optional() }),
  z.string(),
]);

const columnWidthSchema = z.object({
  "@_id": z.string(),
  "#text": z.number(),
});

const columnWidthsNodeSchema = z.union([
  z.object({ col: z.union([columnWidthSchema, z.array(columnWidthSchema)]).optional() }),
  z.string(),
]);

const flowchartSchema = z.object({
  departmentOrder: departmentOrderNodeSchema.optional(),
  stageOrder: stageOrderNodeSchema.optional(),
  nodes: flowchartNodesNodeSchema.optional(),
  edges: flowchartEdgesNodeSchema.optional(),
  stale: z.union([z.string(), z.boolean()]).optional(),
  rowHeights: rowHeightsNodeSchema.optional(),
  columnWidths: columnWidthsNodeSchema.optional(),
});

const processMapSchema = z.object({
  "@_id": z.string().optional(),
  title: z.string(),
  nextActivityId: z.union([z.number(), z.string()]).optional(),
  departments: departmentsNodeSchema.optional(),
  stages: stagesNodeSchema.optional(),
  activities: activitiesNodeSchema.optional(),
  flowchart: flowchartSchema.optional(),
});

// ── Helpers ────────────────────────────────────────────────────────────

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function readSection<T>(section: unknown, key: string): T | undefined {
  if (!section || typeof section === "string") return undefined;
  return (section as Record<string, T>)[key];
}

function readIds(section: unknown): string[] {
  const ids = readSection<unknown>(section, "id");
  return asArray(ids as string);
}

function readRowHeights(
  section: unknown,
): { rowHeights?: Record<string, number> } {
  const rows = readSection<unknown>(section, "row");
  if (!rows) return {};
  const arr = asArray(rows as { "@_id": string; "#text": number });
  const result: Record<string, number> = {};
  for (const r of arr) {
    if (r["@_id"] !== undefined && r["#text"] !== undefined) {
      result[r["@_id"]] = typeof r["#text"] === "string" ? Number(r["#text"]) : r["#text"];
    }
  }
  return Object.keys(result).length > 0 ? { rowHeights: result } : {};
}

function readColumnWidths(
  section: unknown,
): { columnWidths?: Record<string, number> } {
  const cols = readSection<unknown>(section, "col");
  if (!cols) return {};
  const arr = asArray(cols as { "@_id": string; "#text": number });
  const result: Record<string, number> = {};
  for (const c of arr) {
    if (c["@_id"] !== undefined && c["#text"] !== undefined) {
      result[c["@_id"]] = typeof c["#text"] === "string" ? Number(c["#text"]) : c["#text"];
    }
  }
  return Object.keys(result).length > 0 ? { columnWidths: result } : {};
}

// ── Parse mappers ──────────────────────────────────────────────────────

function mapDepartment(raw: { "@_id": string; name: string }): Department {
  return { id: raw["@_id"], name: raw.name };
}

function mapStage(raw: { "@_id": string; name: string }): Stage {
  return { id: raw["@_id"], name: raw.name };
}

function mapActivity(raw: {
  "@_id": string;
  name: string;
  description?: string;
  stageId: string;
  departmentId: string;
  type: string;
  nextIds?: unknown;
  nextLabels?: unknown;
}): Activity {
  const labels = readSection<unknown>(raw.nextLabels, "label");
  const labelArr = asArray(labels as { "@_id": string; "#text": string } | undefined);
  const nextLabels: Record<string, string> = {};
  for (const lbl of labelArr) {
    if (lbl["@_id"] && lbl["#text"]) {
      nextLabels[lbl["@_id"]] = lbl["#text"];
    }
  }

  return {
    id: raw["@_id"],
    name: raw.name,
    description: raw.description,
    stageId: raw.stageId,
    departmentId: raw.departmentId,
    type: raw.type as Activity["type"],
    nextIds: readIds(raw.nextIds),
    ...(Object.keys(nextLabels).length > 0 ? { nextLabels } : {}),
  };
}

function mapNode(raw: { "@_id": string; position: { x: number; y: number } }): FlowchartNode {
  return {
    id: raw["@_id"],
    position: { x: raw.position.x, y: raw.position.y },
  };
}

function mapEdge(raw: { "@_id": string; source: string; target: string; label?: string }): FlowchartEdge {
  return {
    id: raw["@_id"],
    source: raw.source,
    target: raw.target,
    label: raw.label,
  };
}

function mapFlowchart(raw: Record<string, unknown>): FlowchartData {
  const parsed = flowchartSchema.parse(raw) as {
    departmentOrder?: unknown;
    stageOrder?: unknown;
    nodes?: unknown;
    edges?: unknown;
    stale?: string | boolean;
    rowHeights?: unknown;
    columnWidths?: unknown;
  };

  return {
    departmentOrder: readIds(parsed.departmentOrder),
    stageOrder: readIds(parsed.stageOrder),
    nodes: asArray(readSection<unknown>(parsed.nodes, "node")).map((n) =>
      mapNode(n as Parameters<typeof mapNode>[0]),
    ),
    edges: asArray(readSection<unknown>(parsed.edges, "edge")).map((e) =>
      mapEdge(e as Parameters<typeof mapEdge>[0]),
    ),
    stale:
      parsed.stale === true ||
      parsed.stale === "true",
    ...readRowHeights(parsed.rowHeights),
    ...readColumnWidths(parsed.columnWidths),
  };
}

function mapProcessMap(raw: Record<string, unknown>): ProcessMap {
  const parsed = processMapSchema.parse(raw) as {
    "@_id"?: string;
    title: string;
    nextActivityId?: number | string;
    departments?: unknown;
    stages?: unknown;
    activities?: unknown;
    flowchart?: Record<string, unknown>;
  };

  const nextId = parsed.nextActivityId !== undefined
    ? Number(parsed.nextActivityId)
    : 1;

  return {
    id: parsed["@_id"] ?? crypto.randomUUID(),
    title: parsed.title,
    nextActivityId: nextId,
    departments: asArray(readSection<unknown>(parsed.departments, "department")).map((d) =>
      mapDepartment(d as Parameters<typeof mapDepartment>[0]),
    ),
    stages: asArray(readSection<unknown>(parsed.stages, "stage")).map((s) =>
      mapStage(s as Parameters<typeof mapStage>[0]),
    ),
    activities: asArray(readSection<unknown>(parsed.activities, "activity")).map((a) =>
      mapActivity(a as Parameters<typeof mapActivity>[0]),
    ),
    flowchart: parsed.flowchart ? mapFlowchart(parsed.flowchart) : null,
  };
}

// ── Serialize builders ─────────────────────────────────────────────────

function idsNode(ids: string[]) {
  if (ids.length === 0) return {};
  return { id: ids };
}

function departmentsNode(departments: Department[]) {
  if (departments.length === 0) return {};
  return {
    department: departments.map((d) => ({ "@_id": d.id, name: d.name })),
  };
}

function stagesNode(stages: Stage[]) {
  if (stages.length === 0) return {};
  return {
    stage: stages.map((s) => ({ "@_id": s.id, name: s.name })),
  };
}

function nextLabelsNode(
  nextLabels: Record<string, string> | undefined,
): Record<string, unknown> {
  if (!nextLabels || Object.keys(nextLabels).length === 0) return {};
  return {
    label: Object.entries(nextLabels).map(([id, text]) => ({
      "@_id": id,
      "#text": text,
    })),
  };
}

function activitiesNode(activities: Activity[]): { activity?: Array<Record<string, unknown>> } {
  if (activities.length === 0) return {};
  return {
    activity: activities.map((a) => ({
      "@_id": a.id,
      name: a.name,
      ...(a.description ? { description: a.description } : {}),
      stageId: a.stageId,
      departmentId: a.departmentId,
      type: a.type,
      nextIds: idsNode(a.nextIds),
      nextLabels: nextLabelsNode(a.nextLabels),
    })),
  };
}

function flowchartNodesNode(nodes: FlowchartNode[]) {
  if (nodes.length === 0) return {};
  return {
    node: nodes.map((n) => ({
      "@_id": n.id,
      position: { x: n.position.x, y: n.position.y },
    })),
  };
}

function flowchartEdgesNode(edges: FlowchartEdge[]) {
  if (edges.length === 0) return {};
  return {
    edge: edges.map((e) => ({
      "@_id": e.id,
      source: e.source,
      target: e.target,
      ...(e.label ? { label: e.label } : {}),
    })),
  };
}

function rowHeightsNode(rowHeights: Record<string, number>): Record<string, unknown> {
  const entries = Object.entries(rowHeights);
  if (entries.length === 0) return {};
  return {
    row: entries.map(([id, height]) => ({
      "@_id": id,
      "#text": height,
    })),
  };
}

function columnWidthsNode(columnWidths: Record<string, number>): Record<string, unknown> {
  const entries = Object.entries(columnWidths);
  if (entries.length === 0) return {};
  return {
    col: entries.map(([id, width]) => ({
      "@_id": id,
      "#text": width,
    })),
  };
}

function flowchartNode(flowchart: FlowchartData): Record<string, unknown> {
  return {
    departmentOrder: idsNode(flowchart.departmentOrder),
    stageOrder: idsNode(flowchart.stageOrder),
    nodes: flowchartNodesNode(flowchart.nodes),
    edges: flowchartEdgesNode(flowchart.edges),
    stale: flowchart.stale ? "true" : undefined,
    ...(flowchart.rowHeights ? { rowHeights: rowHeightsNode(flowchart.rowHeights) } : {}),
    ...(flowchart.columnWidths ? { columnWidths: columnWidthsNode(flowchart.columnWidths) } : {}),
  };
}

// ── Public exports ──────────────────────────────────────────────────────

export function serializeToXml(map: ProcessMap): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  return builder.build({
    "process-map": {
      "@_id": map.id,
      title: map.title,
      nextActivityId: map.nextActivityId,
      departments: departmentsNode(map.departments),
      stages: stagesNode(map.stages),
      activities: activitiesNode(map.activities),
      ...(map.flowchart ? { flowchart: flowchartNode(map.flowchart) } : {}),
    },
  });
}

export function parseFromXml(xml: string): ProcessMap {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const raw = parser.parse(xml) as { "process-map"?: Record<string, unknown> };

  if (!raw["process-map"]) {
    throw new Error("El archivo XML no contiene la raíz process-map.");
  }

  return mapProcessMap(raw["process-map"]);
}
