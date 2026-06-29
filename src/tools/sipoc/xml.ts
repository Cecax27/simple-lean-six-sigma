import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { z } from "zod";

import type { SIPOCDiagram, SIPOCItem, SIPOCProcess } from "@/tools/sipoc/types";

const itemSchema = z.object({
  "@_id": z.string(),
  label: z.string(),
  description: z.string().optional(),
});

const sectionNodeSchema = z.union([
  z.object({ item: z.union([itemSchema, z.array(itemSchema)]).optional() }),
  z.string(),
]);

const processSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    "@_id": z.string(),
    label: z.string(),
    description: z.string().optional(),
    child: diagramSchema.optional(),
  }),
);

const processListNodeSchema = z.union([
  z.object({ process: z.union([processSchema, z.array(processSchema)]).optional() }),
  z.string(),
]);

const diagramSchema: z.ZodType<unknown> = z.lazy(() =>
  z.object({
    "@_id": z.string().optional(),
    title: z.string(),
    processStart: z.string().optional(),
    processEnd: z.string().optional(),
    suppliers: sectionNodeSchema.optional(),
    inputs: sectionNodeSchema.optional(),
    processes: processListNodeSchema.optional(),
    outputs: sectionNodeSchema.optional(),
    customers: sectionNodeSchema.optional(),
  }),
);

function readItemsSection(section: unknown): unknown {
  if (!section || typeof section === "string") {
    return undefined;
  }

  return (section as { item?: unknown }).item;
}

function readProcessesSection(section: unknown): unknown {
  if (!section || typeof section === "string") {
    return undefined;
  }

  return (section as { process?: unknown }).process;
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function mapItems(items: unknown): SIPOCItem[] {
  return asArray(items as { "@_id": string; label: string; description?: string }).map((item) => ({
    id: item["@_id"],
    label: item.label,
    description: item.description,
  }));
}

function mapProcess(raw: {
  "@_id": string;
  label: string;
  description?: string;
  child?: unknown;
}): SIPOCProcess {
  return {
    id: raw["@_id"],
    label: raw.label,
    description: raw.description,
    child: raw.child ? mapDiagram(raw.child as Record<string, unknown>) : undefined,
  };
}

function mapDiagram(raw: Record<string, unknown>): SIPOCDiagram {
  const parsed = diagramSchema.parse(raw) as {
    "@_id"?: string;
    title: string;
    processStart?: string;
    processEnd?: string;
    suppliers?: unknown;
    inputs?: unknown;
    processes?: unknown;
    outputs?: unknown;
    customers?: unknown;
  };

  return {
    id: parsed["@_id"] ?? crypto.randomUUID(),
    title: parsed.title,
    processStart: parsed.processStart ?? "",
    processEnd: parsed.processEnd ?? "",
    suppliers: mapItems(readItemsSection(parsed.suppliers)),
    inputs: mapItems(readItemsSection(parsed.inputs)),
    processes: asArray(readProcessesSection(parsed.processes)).map((entry) => mapProcess(entry as never)),
    outputs: mapItems(readItemsSection(parsed.outputs)),
    customers: mapItems(readItemsSection(parsed.customers)),
  };
}

function itemNode(items: SIPOCItem[]): { item?: Array<Record<string, string>> } {
  if (items.length === 0) {
    return {};
  }

  return {
    item: items.map((item) => ({
      "@_id": item.id,
      label: item.label,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}

function processNode(processes: SIPOCProcess[]): { process?: Array<Record<string, unknown>> } {
  if (processes.length === 0) {
    return {};
  }

  return {
    process: processes.map((process) => ({
      "@_id": process.id,
      label: process.label,
      ...(process.description ? { description: process.description } : {}),
      ...(process.child ? { child: diagramNode(process.child) } : {}),
    })),
  };
}

function diagramNode(diagram: SIPOCDiagram): Record<string, unknown> {
  return {
    "@_id": diagram.id,
    title: diagram.title,
    ...(diagram.processStart ? { processStart: diagram.processStart } : {}),
    ...(diagram.processEnd ? { processEnd: diagram.processEnd } : {}),
    suppliers: itemNode(diagram.suppliers),
    inputs: itemNode(diagram.inputs),
    processes: processNode(diagram.processes),
    outputs: itemNode(diagram.outputs),
    customers: itemNode(diagram.customers),
  };
}

export function serializeToXml(diagram: SIPOCDiagram): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  return builder.build({
    sipoc: diagramNode(diagram),
  });
}

export function parseFromXml(xml: string): SIPOCDiagram {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const raw = parser.parse(xml) as { sipoc?: Record<string, unknown> };

  if (!raw.sipoc) {
    throw new Error("El archivo XML no contiene la raiz sipoc.");
  }

  return mapDiagram(raw.sipoc);
}
