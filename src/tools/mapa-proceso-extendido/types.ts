import type { ExportFieldOption, ExportLayoutOption } from "@/lib/export/types";

export type ActivityType = "start" | "process" | "decision" | "end";

export interface Department {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  name: string;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  stageId: string;
  departmentId: string;
  type: ActivityType;
  nextIds: string[];
}

export interface FlowchartNode {
  id: string;
  position: { x: number; y: number };
}

export interface FlowchartEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowchartData {
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  departmentOrder: string[];
  stageOrder: string[];
  stale: boolean;
}

export interface ProcessMap {
  id: string;
  title: string;
  nextActivityId: number;
  departments: Department[];
  stages: Stage[];
  activities: Activity[];
  flowchart: FlowchartData | null;
}

export interface ProcessMapState {
  root: ProcessMap;
}

export const processMapExportLayouts: ExportLayoutOption[] = [
  { id: "swimlane", labelEs: "Multicarril" },
];

export const processMapExportFields: ExportFieldOption[] = [
  { id: "title", labelEs: "Título" },
  { id: "date", labelEs: "Fecha" },
  { id: "legend", labelEs: "Leyenda" },
];
