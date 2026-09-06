"use client";

import { create } from "zustand";

import { createChart, createPoint, uid } from "@/tools/carta-control/chart";
import type {
  ChartAxes,
  CenterLineMode,
  ControlChart,
  ControlChartPoint,
} from "@/tools/carta-control/types";

interface CartaControlStore {
  root: ControlChart;
  setTitle: (title: string) => void;
  setUnit: (unit: string) => void;
  addPoint: (label: string, value: number, comment?: string) => void;
  updatePoint: (id: string, data: Partial<Omit<ControlChartPoint, "id">>) => void;
  removePoint: (id: string) => void;
  movePointUp: (id: string) => void;
  movePointDown: (id: string) => void;
  setPoints: (points: ControlChartPoint[]) => void;
  appendPoints: (points: ControlChartPoint[]) => void;
  setUpperLimit: (data: Partial<{ enabled: boolean; value: number }>) => void;
  setLowerLimit: (data: Partial<{ enabled: boolean; value: number }>) => void;
  setCenterLineMode: (mode: CenterLineMode) => void;
  setCenterLineValue: (value: number) => void;
  setAxes: (data: Partial<ChartAxes>) => void;
  replaceRoot: (root: ControlChart) => void;
  reset: () => void;
}

const initialRoot = createChart("Nueva carta de control");

export const useCartaControlStore = create<CartaControlStore>((set) => ({
  root: initialRoot,

  setTitle: (title) => {
    set((state) => ({ root: { ...state.root, title } }));
  },

  setUnit: (unit) => {
    set((state) => ({ root: { ...state.root, unit } }));
  },

  addPoint: (label, value, comment) => {
    set((state) => ({
      root: {
        ...state.root,
        points: [...state.root.points, createPoint(label, value, comment)],
      },
    }));
  },

  updatePoint: (id, data) => {
    set((state) => ({
      root: {
        ...state.root,
        points: state.root.points.map((point) =>
          point.id === id ? { ...point, ...data } : point,
        ),
      },
    }));
  },

  removePoint: (id) => {
    set((state) => ({
      root: {
        ...state.root,
        points: state.root.points.filter((point) => point.id !== id),
      },
    }));
  },

  movePointUp: (id) => {
    set((state) => {
      const index = state.root.points.findIndex((point) => point.id === id);
      if (index <= 0) return state;
      const points = [...state.root.points];
      [points[index - 1], points[index]] = [points[index], points[index - 1]];
      return { root: { ...state.root, points } };
    });
  },

  movePointDown: (id) => {
    set((state) => {
      const index = state.root.points.findIndex((point) => point.id === id);
      if (index < 0 || index >= state.root.points.length - 1) return state;
      const points = [...state.root.points];
      [points[index], points[index + 1]] = [points[index + 1], points[index]];
      return { root: { ...state.root, points } };
    });
  },

  setPoints: (points) => {
    set((state) => ({
      root: {
        ...state.root,
        points: points.map((point) =>
          point.id ? point : { ...point, id: uid("point") },
        ),
      },
    }));
  },

  appendPoints: (points) => {
    set((state) => ({
      root: {
        ...state.root,
        points: [
          ...state.root.points,
          ...points.map((point) =>
            point.id ? point : { ...point, id: uid("point") },
          ),
        ],
      },
    }));
  },

  setUpperLimit: (data) => {
    set((state) => ({
      root: {
        ...state.root,
        limits: { ...state.root.limits, upper: { ...state.root.limits.upper, ...data } },
      },
    }));
  },

  setLowerLimit: (data) => {
    set((state) => ({
      root: {
        ...state.root,
        limits: { ...state.root.limits, lower: { ...state.root.limits.lower, ...data } },
      },
    }));
  },

  setCenterLineMode: (mode) => {
    set((state) => ({
      root: {
        ...state.root,
        centerLine: { ...state.root.centerLine, mode },
      },
    }));
  },

  setCenterLineValue: (value) => {
    set((state) => ({
      root: {
        ...state.root,
        centerLine: { ...state.root.centerLine, value },
      },
    }));
  },

  setAxes: (data) => {
    set((state) => ({
      root: { ...state.root, axes: { ...state.root.axes, ...data } },
    }));
  },

  replaceRoot: (root) => {
    set({ root });
  },

  reset: () => {
    set({ root: createChart("Nueva carta de control") });
  },
}));
