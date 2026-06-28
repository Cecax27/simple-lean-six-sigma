"use client";

import { create } from "zustand";

import type { IshikawaDiagram } from "@/tools/ishikawa/types";
import {
  createCause,
  createCategory,
  createDiagram,
  moveCategory,
  updateCategories,
  updateCauses,
  uid,
} from "@/tools/ishikawa/tree";

interface IshikawaStore {
  root: IshikawaDiagram;

  setTitle: (title: string) => void;
  setEffect: (effect: string) => void;

  addCategory: (label: string) => void;
  removeCategory: (categoryId: string) => void;
  renameCategory: (categoryId: string, label: string) => void;
  moveCategoryUp: (categoryId: string) => void;
  moveCategoryDown: (categoryId: string) => void;

  addCause: (categoryId: string, label: string) => void;
  removeCause: (categoryId: string, causeId: string) => void;
  renameCause: (categoryId: string, causeId: string, label: string) => void;
  setCauseDescription: (categoryId: string, causeId: string, description: string) => void;

  replaceRoot: (root: IshikawaDiagram) => void;
  reset: () => void;
  getCurrent: () => IshikawaDiagram;
}

const initialRoot = createDiagram("Nuevo diagrama Ishikawa");

export const useIshikawaStore = create<IshikawaStore>((set, get) => ({
  root: initialRoot,

  setTitle: (title) =>
    set((state) => ({ root: { ...state.root, title } })),
  setEffect: (effect) =>
    set((state) => ({ root: { ...state.root, effect } })),

  addCategory: (label) =>
    set((state) => ({
      root: updateCategories(state.root, (cats) => [...cats, createCategory(label)]),
    })),
  removeCategory: (categoryId) =>
    set((state) => ({
      root: updateCategories(state.root, (cats) => cats.filter((c) => c.id !== categoryId)),
    })),
  renameCategory: (categoryId, label) =>
    set((state) => ({
      root: updateCategories(state.root, (cats) =>
        cats.map((c) => (c.id === categoryId ? { ...c, label } : c)),
      ),
    })),
  moveCategoryUp: (categoryId) =>
    set((state) => ({ root: moveCategory(state.root, categoryId, -1) })),
  moveCategoryDown: (categoryId) =>
    set((state) => ({ root: moveCategory(state.root, categoryId, 1) })),

  addCause: (categoryId, label) =>
    set((state) => ({
      root: updateCauses(state.root, categoryId, (causes) => [
        ...causes,
        createCause(label),
      ]),
    })),
  removeCause: (categoryId, causeId) =>
    set((state) => ({
      root: updateCauses(state.root, categoryId, (causes) =>
        causes.filter((c) => c.id !== causeId),
      ),
    })),
  renameCause: (categoryId, causeId, label) =>
    set((state) => ({
      root: updateCauses(state.root, categoryId, (causes) =>
        causes.map((c) => (c.id === causeId ? { ...c, label } : c)),
      ),
    })),
  setCauseDescription: (categoryId, causeId, description) =>
    set((state) => ({
      root: updateCauses(state.root, categoryId, (causes) =>
        causes.map((c) => (c.id === causeId ? { ...c, description: description || undefined } : c)),
      ),
    })),

  replaceRoot: (root) => set({ root }),
  reset: () => set({ root: createDiagram("Nuevo diagrama Ishikawa") }),
  getCurrent: () => get().root,
}));
