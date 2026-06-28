"use client";

import { create } from "zustand";

import {
  createTree,
  createNeed,
  createDriver,
  createRequirement,
} from "@/tools/ctq/tree";
import type { CTQNeed, CTQDriver, CTQTree } from "@/tools/ctq/types";

interface CTQStore {
  root: CTQTree;
  selectedNeedId: string | null;
  selectedDriverId: string | null;
  setTitle: (title: string) => void;
  selectNeed: (needId: string | null) => void;
  selectDriver: (driverId: string | null) => void;
  addNeed: (label: string) => void;
  removeNeed: (needId: string) => void;
  updateNeedLabel: (needId: string, label: string) => void;
  addDriver: (label: string) => void;
  removeDriver: (driverId: string) => void;
  updateDriverLabel: (driverId: string, label: string) => void;
  addRequirement: (label: string) => void;
  removeRequirement: (requirementId: string) => void;
  updateRequirementLabel: (requirementId: string, label: string) => void;
  replaceRoot: (root: CTQTree) => void;
  reset: () => void;
  getSelectedNeed: () => CTQNeed | undefined;
  getSelectedDriver: () => CTQDriver | undefined;
}

const initialRoot = createTree("Nuevo arbol CTQ");

export const useCtqStore = create<CTQStore>((set, get) => ({
  root: initialRoot,
  selectedNeedId: null,
  selectedDriverId: null,

  setTitle: (title) =>
    set((state) => ({ root: { ...state.root, title } })),

  selectNeed: (needId) =>
    set({ selectedNeedId: needId, selectedDriverId: null }),

  selectDriver: (driverId) =>
    set({ selectedDriverId: driverId }),

  addNeed: (label) =>
    set((state) => ({
      root: {
        ...state.root,
        needs: [...state.root.needs, createNeed(label.trim())],
      },
    })),

  removeNeed: (needId) =>
    set((state) => ({
      root: {
        ...state.root,
        needs: state.root.needs.filter((n) => n.id !== needId),
      },
      ...(state.selectedNeedId === needId
        ? { selectedNeedId: null, selectedDriverId: null }
        : {}),
    })),

  updateNeedLabel: (needId, label) =>
    set((state) => ({
      root: {
        ...state.root,
        needs: state.root.needs.map((n) =>
          n.id === needId ? { ...n, label } : n,
        ),
      },
    })),

  addDriver: (label) =>
    set((state) => {
      if (!state.selectedNeedId) return state;
      return {
        root: {
          ...state.root,
          needs: state.root.needs.map((n) =>
            n.id === state.selectedNeedId
              ? { ...n, drivers: [...n.drivers, createDriver(label.trim())] }
              : n,
          ),
        },
      };
    }),

  removeDriver: (driverId) =>
    set((state) => ({
      root: {
        ...state.root,
        needs: state.root.needs.map((n) =>
          n.id === state.selectedNeedId
            ? { ...n, drivers: n.drivers.filter((d) => d.id !== driverId) }
            : n,
        ),
      },
      ...(state.selectedDriverId === driverId
        ? { selectedDriverId: null }
        : {}),
    })),

  updateDriverLabel: (driverId, label) =>
    set((state) => {
      if (!state.selectedNeedId) return state;
      return {
        root: {
          ...state.root,
          needs: state.root.needs.map((n) =>
            n.id === state.selectedNeedId
              ? {
                  ...n,
                  drivers: n.drivers.map((d) =>
                    d.id === driverId ? { ...d, label } : d,
                  ),
                }
              : n,
          ),
        },
      };
    }),

  addRequirement: (label) =>
    set((state) => {
      if (!state.selectedNeedId || !state.selectedDriverId) return state;
      return {
        root: {
          ...state.root,
          needs: state.root.needs.map((n) =>
            n.id === state.selectedNeedId
              ? {
                  ...n,
                  drivers: n.drivers.map((d) =>
                    d.id === state.selectedDriverId
                      ? {
                          ...d,
                          requirements: [
                            ...d.requirements,
                            createRequirement(label.trim()),
                          ],
                        }
                      : d,
                  ),
                }
              : n,
          ),
        },
      };
    }),

  removeRequirement: (requirementId) =>
    set((state) => {
      if (!state.selectedNeedId || !state.selectedDriverId) return state;
      return {
        root: {
          ...state.root,
          needs: state.root.needs.map((n) =>
            n.id === state.selectedNeedId
              ? {
                  ...n,
                  drivers: n.drivers.map((d) =>
                    d.id === state.selectedDriverId
                      ? {
                          ...d,
                          requirements: d.requirements.filter(
                            (r) => r.id !== requirementId,
                          ),
                        }
                      : d,
                  ),
                }
              : n,
          ),
        },
      };
    }),

  updateRequirementLabel: (requirementId, label) =>
    set((state) => {
      if (!state.selectedNeedId || !state.selectedDriverId) return state;
      return {
        root: {
          ...state.root,
          needs: state.root.needs.map((n) =>
            n.id === state.selectedNeedId
              ? {
                  ...n,
                  drivers: n.drivers.map((d) =>
                    d.id === state.selectedDriverId
                      ? {
                          ...d,
                          requirements: d.requirements.map((r) =>
                            r.id === requirementId ? { ...r, label } : r,
                          ),
                        }
                      : d,
                  ),
                }
              : n,
          ),
        },
      };
    }),

  replaceRoot: (root) =>
    set({ root, selectedNeedId: null, selectedDriverId: null }),

  reset: () =>
    set({
      root: createTree("Nuevo arbol CTQ"),
      selectedNeedId: null,
      selectedDriverId: null,
    }),

  getSelectedNeed: () => {
    const { root, selectedNeedId } = get();
    if (!selectedNeedId) return undefined;
    return root.needs.find((n) => n.id === selectedNeedId);
  },

  getSelectedDriver: () => {
    const { root, selectedNeedId, selectedDriverId } = get();
    if (!selectedNeedId || !selectedDriverId) return undefined;
    const need = root.needs.find((n) => n.id === selectedNeedId);
    if (!need) return undefined;
    return need.drivers.find((d) => d.id === selectedDriverId);
  },
}));
