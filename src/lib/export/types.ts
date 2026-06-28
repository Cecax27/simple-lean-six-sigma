export type ExportFormat = "svg" | "png" | "pdf";

export type ExportSizeUnit = "px" | "cm";

export interface ExportLayoutOption {
  id: string;
  labelEs: string;
}

export interface ExportFieldOption {
  id: string;
  labelEs: string;
}

export interface ExportSize {
  value: number;
  unit: ExportSizeUnit;
}

export interface ExportColors {
  header: string;
  card: string;
  accent: string;
  background: string;
  text: string;
}

export interface ExportWatermark {
  enabled: boolean;
  text: string;
}

export interface ExportOptions {
  layout: string;
  format: ExportFormat;
  size: ExportSize;
  colors: ExportColors;
  watermark: ExportWatermark;
  fields: string[];
}

export const lightExportColors: ExportColors = {
  header: "#fafafa",
  card: "#ffffff",
  accent: "#f5f5f5",
  background: "#ffffff",
  text: "#18181b",
};

export const darkExportColors: ExportColors = {
  header: "#18181b",
  card: "#27272a",
  accent: "#3f3f46",
  background: "#09090b",
  text: "#fafafa",
};

export const EXPORT_COLOR_PRESETS: { id: string; labelEs: string; colors: ExportColors }[] = [
  { id: "light", labelEs: "Claro", colors: lightExportColors },
  { id: "dark", labelEs: "Oscuro", colors: darkExportColors },
];
