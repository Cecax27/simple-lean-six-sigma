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

export type ExportFormat = "svg" | "png" | "pdf";

export type ExportLayout = "pez" | "compacto" | "arbol";

export const SIX_M_DEFAULTS = [
  { label: "Mano de obra" },
  { label: "Metodos" },
  { label: "Maquinas" },
  { label: "Materiales" },
  { label: "Mediciones" },
  { label: "Entorno" },
];
