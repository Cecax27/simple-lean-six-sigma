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
