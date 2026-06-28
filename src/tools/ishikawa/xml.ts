import { XMLBuilder, XMLParser } from "fast-xml-parser";
import { z } from "zod";

import type { IshikawaCause, IshikawaCategory, IshikawaDiagram } from "@/tools/ishikawa/types";

const builder = new XMLBuilder({
  format: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  suppressEmptyNode: true,
});

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  trimValues: true,
});

// --- Zod schemas ---

const causeSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  "@_id": z.string().optional(),
});

const causeNodeSchema = z.union([
  z.object({ causa: z.array(causeSchema).optional() }).passthrough(),
  causeSchema,
  z.string(),
]);

const categorySchema = z.object({
  "@_id": z.string().optional(),
  label: z.string(),
  '@_label': z.string().optional(),
  causa: z.union([z.array(causeSchema), causeSchema]).optional(),
});

const categoryListNodeSchema = z.union([z.array(categorySchema).optional(), categorySchema, z.string()]);

const ishikawaSchema = z.object({
  "@_id": z.string().optional(),
  "@_title": z.string().optional(),
  "@_effect": z.string().optional(),
  titulo: z.string().optional(),
  efecto: z.string().optional(),
  categorias: z
    .union([z.object({ categoria: categoryListNodeSchema }).optional(), z.string()])
    .optional(),
});

// --- Helpers ---

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function toArray<T>(value: unknown): T[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value as T[];
  return [value as T];
}

// --- Serialize ---

function causeNode(cause: IshikawaCause): Record<string, unknown> {
  const node: Record<string, unknown> = { label: cause.label, "@_id": cause.id };
  if (cause.description) node.description = cause.description;
  return node;
}

function categoryNode(category: IshikawaCategory): Record<string, unknown> {
  const node: Record<string, unknown> = { label: category.label, "@_id": category.id };
  if (category.causes.length > 0) {
    node.causa = category.causes.map(causeNode);
  }
  return node;
}

export function serializeToXml(diagram: IshikawaDiagram): string {
  const diagramNode: Record<string, unknown> = {
    "@_id": diagram.id,
    titulo: diagram.title,
    efecto: diagram.effect,
  };
  if (diagram.categories.length > 0) {
    diagramNode.categorias = {
      categoria: diagram.categories.map(categoryNode),
    };
  }
  return builder.build({ ishikawa: diagramNode });
}

// --- Parse ---

function mapCause(raw: Record<string, unknown>): IshikawaCause {
  return {
    id: (raw["@_id"] as string) || crypto.randomUUID(),
    label: (raw.label as string) || "",
    description: raw.description as string | undefined,
  };
}

function mapCategory(raw: Record<string, unknown>): IshikawaCategory {
  const causas = raw.causa as Record<string, unknown> | Record<string, unknown>[] | undefined;
  return {
    id: (raw["@_id"] as string) || crypto.randomUUID(),
    label: ((raw.label || raw["@_label"]) as string) || "",
    causes: toArray<Record<string, unknown>>(causas).map(mapCause),
  };
}

export function parseFromXml(xml: string): IshikawaDiagram {
  const raw = parser.parse(xml);

  if (!raw || typeof raw !== "object") {
    throw new Error("El XML no contiene un elemento raiz valido.");
  }

  const rawIshikawa = (raw as Record<string, unknown>).ishikawa as Record<string, unknown> | undefined;
  if (!rawIshikawa) {
    throw new Error("El archivo XML no contiene la raiz ishikawa.");
  }

  const parsed = ishikawaSchema.safeParse(rawIshikawa);
  if (!parsed.success) {
    console.error("Zod validation errors:", parsed.error.issues);
  }

  const id = (rawIshikawa["@_id"] as string) || crypto.randomUUID();
  const title = (rawIshikawa.titulo as string) || (rawIshikawa["@_title"] as string) || "";
  const effect = (rawIshikawa.efecto as string) || (rawIshikawa["@_effect"] as string) || "";

  let categories: IshikawaCategory[] = [];
  const categoriasRaw = rawIshikawa.categorias as Record<string, unknown> | undefined;
  if (categoriasRaw) {
    const categoriaRaw = categoriasRaw.categoria;
    categories = toArray<Record<string, unknown>>(categoriaRaw).map(mapCategory);
  }

  return { id, title, effect, categories };
}
