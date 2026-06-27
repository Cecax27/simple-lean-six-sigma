export type ToolId = "sipoc" | "ishikawa" | "pareto" | "cinco-porques" | "dmaic";

export interface ToolDescriptor {
  id: ToolId;
  nameEs: string;
  descriptionEs: string;
  hrefBase: string;
  status: "ready" | "soon";
}

export const TOOLS: ToolDescriptor[] = [
  {
    id: "sipoc",
    nameEs: "SIPOC",
    descriptionEs:
      "Diagramas de Proveedores, Entradas, Proceso, Salidas y Clientes con anidamiento hasta 3 niveles.",
    hrefBase: "/sipoc",
    status: "ready",
  },
  {
    id: "ishikawa",
    nameEs: "Ishikawa",
    descriptionEs:
      "Diagrama de causa-efecto (espina de pescado) para analisis de raiz de problemas.",
    hrefBase: "/ishikawa",
    status: "soon",
  },
  {
    id: "pareto",
    nameEs: "Pareto",
    descriptionEs:
      "Analisis de Pareto para identificar las causas principales de un problema.",
    hrefBase: "/pareto",
    status: "soon",
  },
  {
    id: "cinco-porques",
    nameEs: "5 Porques",
    descriptionEs:
      "Metodo de los 5 Porques para analisis de causa raiz paso a paso.",
    hrefBase: "/cinco-porques",
    status: "soon",
  },
  {
    id: "dmaic",
    nameEs: "DMAIC",
    descriptionEs:
      "Marco estructurado Definir, Medir, Analizar, Mejorar y Controlar.",
    hrefBase: "/dmaic",
    status: "soon",
  },
];

export function getTool(id: ToolId): ToolDescriptor | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function getToolsByStatus(status: "ready" | "soon"): ToolDescriptor[] {
  return TOOLS.filter((t) => t.status === status);
}
