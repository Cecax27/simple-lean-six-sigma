import type { Department, ProcessMap, Stage } from "@/tools/mapa-proceso-extendido/types";

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createProcessMap(title: string): ProcessMap {
  return {
    id: uid("map"),
    title,
    nextActivityId: 1,
    departments: [],
    stages: [],
    activities: [],
    flowchart: null,
  };
}

export function createDepartment(name: string): Department {
  return { id: uid("dep"), name };
}

export function createStage(name: string): Stage {
  return { id: uid("stg"), name };
}
