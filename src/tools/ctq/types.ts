import type { ExportLayoutOption, ExportFieldOption } from "@/lib/export/types";

export interface CTQRequirement {
  id: string;
  label: string;
  description?: string;
}

export interface CTQDriver {
  id: string;
  label: string;
  description?: string;
  requirements: CTQRequirement[];
}

export interface CTQNeed {
  id: string;
  label: string;
  description?: string;
  drivers: CTQDriver[];
}

export interface CTQTree {
  id: string;
  title: string;
  needs: CTQNeed[];
}

export interface CTQState {
  root: CTQTree;
  selectedNeedId: string | null;
  selectedDriverId: string | null;
}

export const ctqExportLayouts: ExportLayoutOption[] = [
  { id: "cards", labelEs: "Tarjetas" },
  { id: "flat", labelEs: "Plano" },
];

export const ctqExportFields: ExportFieldOption[] = [
  { id: "title", labelEs: "Titulo" },
  { id: "date", labelEs: "Fecha" },
];
