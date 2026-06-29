export interface IshikawaCause {
  id: string;
  label: string;
  description?: string;
}

export interface IshikawaCategory {
  id: string;
  label: string;
  causes: IshikawaCause[];
}

export interface IshikawaDiagram {
  id: string;
  title: string;
  effect: string;
  categories: IshikawaCategory[];
}

export type { ExportFormat } from "@/lib/export/types";

import type { ExportLayoutOption, ExportFieldOption } from "@/lib/export/types";

export type ExportLayout = "pez" | "compacto" | "arbol";

export const ishikawaExportLayouts: ExportLayoutOption[] = [
  { id: "pez", labelEs: "Pez clasico" },
  { id: "compacto", labelEs: "Compacto" },
  { id: "arbol", labelEs: "Arbol" },
];

export const ishikawaExportFields: ExportFieldOption[] = [
  { id: "title", labelEs: "Titulo" },
  { id: "effect", labelEs: "Efecto" },
  { id: "date", labelEs: "Fecha" },
];

export const SIX_M_DEFAULTS = [
  { label: "Mano de obra" },
  { label: "Metodos" },
  { label: "Maquinas" },
  { label: "Materiales" },
  { label: "Mediciones" },
  { label: "Entorno" },
];
