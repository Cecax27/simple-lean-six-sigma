export type SIPOCSection = "suppliers" | "inputs" | "outputs" | "customers";

export interface SIPOCItem {
  id: string;
  label: string;
  description?: string;
}

export interface SIPOCProcess {
  id: string;
  label: string;
  description?: string;
  child?: SIPOCDiagram;
}

export interface SIPOCDiagram {
  id: string;
  title: string;
  processStart?: string;
  processEnd?: string;
  suppliers: SIPOCItem[];
  inputs: SIPOCItem[];
  processes: SIPOCProcess[];
  outputs: SIPOCItem[];
  customers: SIPOCItem[];
}

export interface SIPOCState {
  root: SIPOCDiagram;
  path: string[];
}

export type { ExportFormat } from "@/lib/export/types";

import type { ExportLayoutOption, ExportFieldOption } from "@/lib/export/types";

export const sipocExportLayouts: ExportLayoutOption[] = [
  { id: "cards", labelEs: "Tarjetas" },
  { id: "flat", labelEs: "Plano" },
];

export const sipocExportFields: ExportFieldOption[] = [
  { id: "title", labelEs: "Titulo" },
  { id: "scope", labelEs: "Alcance" },
  { id: "date", labelEs: "Fecha" },
];
