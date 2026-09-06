export interface ControlChartPoint {
  id: string;
  label: string;
  value: number;
  comment?: string;
}

export interface ChartLimit {
  enabled: boolean;
  value: number;
}

export interface ChartLimits {
  upper: ChartLimit;
  lower: ChartLimit;
}

export type CenterLineMode = "auto" | "manual";

export interface ChartCenterLine {
  mode: CenterLineMode;
  value: number;
}

export interface ChartAxes {
  xTickStep: number;
  yTickCount: number;
  yMin: number | null;
  yMax: number | null;
}

export interface ControlChart {
  id: string;
  title: string;
  unit: string;
  points: ControlChartPoint[];
  limits: ChartLimits;
  centerLine: ChartCenterLine;
  axes: ChartAxes;
}

export type { ExportFormat } from "@/lib/export/types";

import type { ExportLayoutOption, ExportFieldOption } from "@/lib/export/types";

export const cartaControlExportLayouts: ExportLayoutOption[] = [
  { id: "grafica", labelEs: "Grafica" },
  { id: "grafica-tabla", labelEs: "Grafica + tabla" },
];

export const cartaControlExportFields: ExportFieldOption[] = [
  { id: "title", labelEs: "Titulo" },
  { id: "date", labelEs: "Fecha" },
  { id: "limits", labelEs: "Limites" },
  { id: "stats", labelEs: "Estadisticas" },
];
