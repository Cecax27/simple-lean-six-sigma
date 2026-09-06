export type ToolId =
  | "sipoc"
  | "ishikawa"
  | "ctq"
  | "mapa-proceso-extendido"
  | "carta-control"
  | "pareto"
  | "cinco-porques"
  | "dmaic";

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
    status: "ready",
  },
  {
    id: "ctq",
    nameEs: "Arbol CTQ",
    descriptionEs:
      "Arbol de necesidades criticas del cliente, impulsores y requisitos (Critical-to-Quality) en formato horizontal.",
    hrefBase: "/ctq",
    status: "ready",
  },
  {
    id: "mapa-proceso-extendido",
    nameEs: "Mapa de Proceso Extendido",
    descriptionEs:
      "Diagrama de flujo multicarril por departamento y etapa con edición interactiva.",
    hrefBase: "/mapa-proceso-extendido",
    status: "ready",
  },
  {
    id: "carta-control",
    nameEs: "Carta de Control",
    descriptionEs:
      "Carta de control interactiva con limites LCS/LCI, linea central y comentarios por punto.",
    hrefBase: "/carta-control",
    status: "ready",
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
