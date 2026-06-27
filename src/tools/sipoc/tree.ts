import type { SIPOCDiagram, SIPOCProcess } from "@/tools/sipoc/types";

export const MAX_NESTING_DEPTH = 3;

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createDiagram(title: string): SIPOCDiagram {
  return {
    id: uid("sipoc"),
    title,
    processStart: "",
    processEnd: "",
    suppliers: [],
    inputs: [],
    processes: [],
    outputs: [],
    customers: [],
  };
}

export function createProcess(label: string): SIPOCProcess {
  return {
    id: uid("proc"),
    label,
  };
}

export function getDiagramAtPath(root: SIPOCDiagram, path: string[]): SIPOCDiagram {
  let current: SIPOCDiagram = root;

  for (const processId of path) {
    const process = current.processes.find((entry) => entry.id === processId);
    if (!process?.child) {
      return current;
    }
    current = process.child;
  }

  return current;
}

export function updateDiagramAtPath(
  root: SIPOCDiagram,
  path: string[],
  updater: (diagram: SIPOCDiagram) => SIPOCDiagram,
): SIPOCDiagram {
  if (path.length === 0) {
    return updater(root);
  }

  const [currentId, ...rest] = path;

  return {
    ...root,
    processes: root.processes.map((process) => {
      if (process.id !== currentId) {
        return process;
      }

      if (!process.child) {
        return process;
      }

      return {
        ...process,
        child: updateDiagramAtPath(process.child, rest, updater),
      };
    }),
  };
}

export function ensureChildDiagram(root: SIPOCDiagram, path: string[], processId: string): SIPOCDiagram {
  return updateDiagramAtPath(root, path, (diagram) => ({
    ...diagram,
    processes: diagram.processes.map((process) => {
      if (process.id !== processId) {
        return process;
      }

      if (process.child) {
        return process;
      }

      return {
        ...process,
        child: createDiagram(`Detalle de ${process.label}`),
      };
    }),
  }));
}
