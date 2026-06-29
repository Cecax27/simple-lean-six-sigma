import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { z } from "zod";

import type { CTQTree, CTQNeed, CTQDriver, CTQRequirement } from "@/tools/ctq/types";

const requirementSchema = z.object({
  "@_id": z.string(),
  label: z.string(),
  description: z.string().optional(),
});

const requirementsNodeSchema = z.union([
  z.object({
    requirement: z.union([requirementSchema, z.array(requirementSchema)]).optional(),
  }),
  z.string(),
]);

const driverSchema = z.object({
  "@_id": z.string(),
  label: z.string(),
  description: z.string().optional(),
  requirements: requirementsNodeSchema.optional(),
});

const driversNodeSchema = z.union([
  z.object({
    driver: z.union([driverSchema, z.array(driverSchema)]).optional(),
  }),
  z.string(),
]);

const needSchema = z.object({
  "@_id": z.string(),
  label: z.string(),
  description: z.string().optional(),
  drivers: driversNodeSchema.optional(),
});

const needsNodeSchema = z.union([
  z.object({
    need: z.union([needSchema, z.array(needSchema)]).optional(),
  }),
  z.string(),
]);

const treeSchema = z.object({
  "@_id": z.string().optional(),
  title: z.string(),
  needs: needsNodeSchema.optional(),
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function readRequirementsSection(section: unknown): unknown {
  if (!section || typeof section === "string") {
    return undefined;
  }
  return (section as { requirement?: unknown }).requirement;
}

function readDriversSection(section: unknown): unknown {
  if (!section || typeof section === "string") {
    return undefined;
  }
  return (section as { driver?: unknown }).driver;
}

function readNeedsSection(section: unknown): unknown {
  if (!section || typeof section === "string") {
    return undefined;
  }
  return (section as { need?: unknown }).need;
}

function mapRequirement(raw: {
  "@_id": string;
  label: string;
  description?: string;
}): CTQRequirement {
  return {
    id: raw["@_id"],
    label: raw.label,
    description: raw.description,
  };
}

function mapDriver(raw: {
  "@_id": string;
  label: string;
  description?: string;
  requirements?: unknown;
}): CTQDriver {
  return {
    id: raw["@_id"],
    label: raw.label,
    description: raw.description,
    requirements: asArray(
      readRequirementsSection(raw.requirements),
    ).map((entry) => mapRequirement(entry as never)),
  };
}

function mapNeed(raw: {
  "@_id": string;
  label: string;
  description?: string;
  drivers?: unknown;
}): CTQNeed {
  return {
    id: raw["@_id"],
    label: raw.label,
    description: raw.description,
    drivers: asArray(readDriversSection(raw.drivers)).map((entry) =>
      mapDriver(entry as never),
    ),
  };
}

function mapTree(raw: Record<string, unknown>): CTQTree {
  const parsed = treeSchema.parse(raw) as {
    "@_id"?: string;
    title: string;
    needs?: unknown;
  };

  return {
    id: parsed["@_id"] ?? crypto.randomUUID(),
    title: parsed.title,
    needs: asArray(readNeedsSection(parsed.needs)).map((entry) =>
      mapNeed(entry as never),
    ),
  };
}

function requirementNode(
  requirements: CTQRequirement[],
): { requirement?: Array<Record<string, string>> } {
  if (requirements.length === 0) {
    return {};
  }

  return {
    requirement: requirements.map((req) => ({
      "@_id": req.id,
      label: req.label,
      ...(req.description ? { description: req.description } : {}),
    })),
  };
}

function driverNode(
  drivers: CTQDriver[],
): { driver?: Array<Record<string, unknown>> } {
  if (drivers.length === 0) {
    return {};
  }

  return {
    driver: drivers.map((driver) => ({
      "@_id": driver.id,
      label: driver.label,
      ...(driver.description ? { description: driver.description } : {}),
      requirements: requirementNode(driver.requirements),
    })),
  };
}

function needNode(
  needs: CTQNeed[],
): { need?: Array<Record<string, unknown>> } {
  if (needs.length === 0) {
    return {};
  }

  return {
    need: needs.map((need) => ({
      "@_id": need.id,
      label: need.label,
      ...(need.description ? { description: need.description } : {}),
      drivers: driverNode(need.drivers),
    })),
  };
}

function treeNode(tree: CTQTree): Record<string, unknown> {
  return {
    "@_id": tree.id,
    title: tree.title,
    needs: needNode(tree.needs),
  };
}

export function serializeToXml(tree: CTQTree): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    format: true,
    suppressEmptyNode: true,
  });

  return builder.build({
    ctq: treeNode(tree),
  });
}

export function parseFromXml(xml: string): CTQTree {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const raw = parser.parse(xml) as { ctq?: Record<string, unknown> };

  if (!raw.ctq) {
    throw new Error("El archivo XML no contiene la raiz ctq.");
  }

  return mapTree(raw.ctq);
}
