"use client";

import { create } from "zustand";

import { createDepartment, createProcessMap, createStage } from "@/tools/mapa-proceso-extendido/tree";
import type {
  Activity,
  ActivityType,
  FlowchartData,
  ProcessMap,
  ProcessMapState,
} from "@/tools/mapa-proceso-extendido/types";

interface ProcessMapStore extends ProcessMapState {
  setTitle: (title: string) => void;
  replaceRoot: (root: ProcessMap) => void;
  reset: () => void;
  addDepartment: (name: string) => void;
  removeDepartment: (id: string) => void;
  updateDepartment: (id: string, name: string) => void;
  reorderDepartments: (ids: string[]) => void;
  addStage: (name: string) => void;
  removeStage: (id: string) => void;
  updateStage: (id: string, name: string) => void;
  reorderStages: (ids: string[]) => void;
  addActivity: (data: {
    stageId: string;
    departmentId: string;
    name: string;
    description?: string;
    type: ActivityType;
    previousIds: string[];
    nextIds: string[];
  }) => void;
  updateActivity: (id: string, data: Partial<Omit<Activity, "id">>) => void;
  removeActivity: (id: string) => void;
  setFlowchart: (data: FlowchartData | null) => void;
  updateFlowchartNode: (id: string, position: { x: number; y: number }) => void;
  markStale: () => void;
}

const initialRoot = createProcessMap("Nuevo mapa de proceso");

export const useProcessMapStore = create<ProcessMapStore>((set) => ({
  root: initialRoot,

  setTitle: (title) => {
    set((state) => ({
      root: { ...state.root, title },
    }));
  },

  replaceRoot: (root) => {
    set({ root });
  },

  reset: () => {
    set({ root: createProcessMap("Nuevo mapa de proceso") });
  },

  addDepartment: (name) => {
    set((state) => ({
      root: {
        ...state.root,
        departments: [...state.root.departments, createDepartment(name.trim())],
      },
    }));
  },

  removeDepartment: (id) => {
    set((state) => ({
      root: {
        ...state.root,
        departments: state.root.departments.filter((d) => d.id !== id),
      },
    }));
  },

  updateDepartment: (id, name) => {
    set((state) => ({
      root: {
        ...state.root,
        departments: state.root.departments.map((d) =>
          d.id === id ? { ...d, name } : d,
        ),
      },
    }));
  },

  reorderDepartments: (ids) => {
    set((state) => {
      const lookup = new Map(state.root.departments.map((d) => [d.id, d]));
      return {
        root: {
          ...state.root,
          departments: ids.map((id) => lookup.get(id)!),
        },
      };
    });
  },

  addStage: (name) => {
    set((state) => ({
      root: {
        ...state.root,
        stages: [...state.root.stages, createStage(name.trim())],
      },
    }));
  },

  removeStage: (id) => {
    set((state) => ({
      root: {
        ...state.root,
        stages: state.root.stages.filter((s) => s.id !== id),
      },
    }));
  },

  updateStage: (id, name) => {
    set((state) => ({
      root: {
        ...state.root,
        stages: state.root.stages.map((s) =>
          s.id === id ? { ...s, name } : s,
        ),
      },
    }));
  },

  reorderStages: (ids) => {
    set((state) => {
      const lookup = new Map(state.root.stages.map((s) => [s.id, s]));
      return {
        root: {
          ...state.root,
          stages: ids.map((id) => lookup.get(id)!),
        },
      };
    });
  },

  addActivity: (data) => {
    set((state) => ({
      root: {
        ...state.root,
        nextActivityId: state.root.nextActivityId + 1,
        activities: [
          ...state.root.activities,
          {
            id: String(state.root.nextActivityId),
            stageId: data.stageId,
            departmentId: data.departmentId,
            name: data.name.trim(),
            description: data.description?.trim(),
            type: data.type,
            previousIds: data.previousIds,
            nextIds: data.nextIds,
          },
        ],
      },
    }));
  },

  updateActivity: (id, data) => {
    set((state) => ({
      root: {
        ...state.root,
        activities: state.root.activities.map((a) =>
          a.id === id
            ? {
                ...a,
                ...data,
                name: data.name !== undefined ? data.name.trim() : a.name,
                description:
                  data.description !== undefined
                    ? data.description.trim()
                    : a.description,
              }
            : a,
        ),
      },
    }));
  },

  removeActivity: (id) => {
    set((state) => ({
      root: {
        ...state.root,
        activities: state.root.activities.filter((a) => a.id !== id),
      },
    }));
  },

  setFlowchart: (data) => {
    set((state) => ({
      root: { ...state.root, flowchart: data },
    }));
  },

  updateFlowchartNode: (id, position) => {
    set((state) => {
      if (!state.root.flowchart) return state;
      return {
        root: {
          ...state.root,
          flowchart: {
            ...state.root.flowchart,
            nodes: state.root.flowchart.nodes.map((n) =>
              n.id === id ? { ...n, position } : n,
            ),
          },
        },
      };
    });
  },

  markStale: () => {
    set((state) => {
      if (!state.root.flowchart) return state;
      return {
        root: {
          ...state.root,
          flowchart: { ...state.root.flowchart, stale: true },
        },
      };
    });
  },
}));

export function useProcessMapRoot(): ProcessMap {
  return useProcessMapStore((s) => s.root);
}

export function useProcessMapTitle(): string {
  return useProcessMapStore((s) => s.root.title);
}
