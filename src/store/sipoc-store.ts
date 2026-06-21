"use client";

import { create } from "zustand";

import {
  MAX_NESTING_DEPTH,
  createDiagram,
  createProcess,
  ensureChildDiagram,
  getDiagramAtPath,
  uid,
  updateDiagramAtPath,
} from "@/lib/sipoc-tree";
import type { SIPOCDiagram, SIPOCSection, SIPOCState } from "@/types/sipoc";

interface SIPOCStore extends SIPOCState {
  setTitle: (title: string) => void;
  setProcessStart: (value: string) => void;
  setProcessEnd: (value: string) => void;
  addItem: (section: SIPOCSection, label: string) => void;
  removeItem: (section: SIPOCSection, itemId: string) => void;
  addProcess: (label: string) => void;
  removeProcess: (processId: string) => void;
  enterProcess: (processId: string) => void;
  navigateToLevel: (level: number) => void;
  navigateToPath: (path: string[]) => void;
  replaceRoot: (root: SIPOCDiagram) => void;
  reset: () => void;
  getCurrent: () => SIPOCDiagram;
}

const initialRoot = createDiagram("Proceso principal");

export const useSipocStore = create<SIPOCStore>((set, get) => ({
  root: initialRoot,
  path: [],
  setTitle: (title) => {
    set((state) => ({
      root: updateDiagramAtPath(state.root, state.path, (diagram) => ({
        ...diagram,
        title,
      })),
    }));
  },
  setProcessStart: (value) => {
    set((state) => ({
      root: updateDiagramAtPath(state.root, state.path, (diagram) => ({
        ...diagram,
        processStart: value,
      })),
    }));
  },
  setProcessEnd: (value) => {
    set((state) => ({
      root: updateDiagramAtPath(state.root, state.path, (diagram) => ({
        ...diagram,
        processEnd: value,
      })),
    }));
  },
  addItem: (section, label) => {
    set((state) => ({
      root: updateDiagramAtPath(state.root, state.path, (diagram) => ({
        ...diagram,
        [section]: [...diagram[section], { id: uid(section), label: label.trim() }],
      })),
    }));
  },
  removeItem: (section, itemId) => {
    set((state) => ({
      root: updateDiagramAtPath(state.root, state.path, (diagram) => ({
        ...diagram,
        [section]: diagram[section].filter((item) => item.id !== itemId),
      })),
    }));
  },
  addProcess: (label) => {
    set((state) => ({
      root: updateDiagramAtPath(state.root, state.path, (diagram) => ({
        ...diagram,
        processes: [...diagram.processes, createProcess(label.trim())],
      })),
    }));
  },
  removeProcess: (processId) => {
    set((state) => ({
      root: updateDiagramAtPath(state.root, state.path, (diagram) => ({
        ...diagram,
        processes: diagram.processes.filter((process) => process.id !== processId),
      })),
    }));
  },
  enterProcess: (processId) => {
    set((state) => {
      if (state.path.length >= MAX_NESTING_DEPTH) {
        return state;
      }

      const rootWithChild = ensureChildDiagram(state.root, state.path, processId);
      return {
        root: rootWithChild,
        path: [...state.path, processId],
      };
    });
  },
  navigateToLevel: (level) => {
    set((state) => ({
      path: state.path.slice(0, level),
    }));
  },
  navigateToPath: (targetPath) => {
    set((state) => {
      let current = state.root;

      for (const processId of targetPath) {
        const process = current.processes.find((entry) => entry.id === processId);
        if (!process?.child) {
          return state;
        }
        current = process.child;
      }

      return {
        path: targetPath,
      };
    });
  },
  replaceRoot: (root) => {
    set({ root, path: [] });
  },
  reset: () => {
    set({ root: createDiagram("Proceso principal"), path: [] });
  },
  getCurrent: () => {
    const state = get();
    return getDiagramAtPath(state.root, state.path);
  },
}));
