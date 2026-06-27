"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { parseFromXml } from "@/lib/xml";

export type ToolId = "sipoc" | "ishikawa" | "pareto" | "cinco-porques" | "dmaic";

export interface DocMeta {
  id: string;
  toolId: ToolId;
  title: string;
  createdAt: number;
  updatedAt: number;
}

interface DocsState {
  docs: Record<string, DocMeta>;
  data: Record<string, unknown>;
  createDoc: (toolId: ToolId, title?: string) => string;
  deleteDoc: (id: string) => void;
  renameDoc: (id: string, title: string) => void;
  setDocData: (id: string, data: unknown) => void;
  getDoc: (id: string) => DocMeta | undefined;
  getDocData: (id: string) => unknown | undefined;
  migrateFromLegacy: () => boolean;
  _migrationDone: boolean;
}

const STORAGE_KEY = "simple-lss-docs-v1";
const LEGACY_KEY = "simple-sipoc-autosave-v1";

export const useDocsStore = create<DocsState>()(
  persist(
    (set, get) => ({
      docs: {},
      data: {},
      _migrationDone: false,

      createDoc: (toolId, title) => {
        const id = crypto.randomUUID();
        const now = Date.now();
        const doc: DocMeta = {
          id,
          toolId,
          title: title ?? "Sin titulo",
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          docs: { ...state.docs, [id]: doc },
          data: { ...state.data, [id]: undefined },
        }));
        return id;
      },

      deleteDoc: (id) => {
        set((state) => {
          const { [id]: _, ...remainingDocs } = state.docs;
          const { [id]: __, ...remainingData } = state.data;
          return { docs: remainingDocs, data: remainingData };
        });
      },

      renameDoc: (id, title) => {
        set((state) => {
          const doc = state.docs[id];
          if (!doc) return state;
          return {
            docs: {
              ...state.docs,
              [id]: { ...doc, title, updatedAt: Date.now() },
            },
          };
        });
      },

      setDocData: (id, data) => {
        set((state) => ({
          data: { ...state.data, [id]: data },
          docs: {
            ...state.docs,
            ...(state.docs[id]
              ? { [id]: { ...state.docs[id], updatedAt: Date.now() } }
              : {}),
          },
        }));
      },

      getDoc: (id) => {
        return get().docs[id];
      },

      getDocData: (id) => {
        return get().data[id];
      },

      migrateFromLegacy: () => {
        const state = get();
        if (state._migrationDone) return false;
        if (typeof window === "undefined") return false;

        try {
          const raw = localStorage.getItem(LEGACY_KEY);
          if (!raw) {
            set({ _migrationDone: true });
            return false;
          }

          const diagram = parseFromXml(raw);

          const id = crypto.randomUUID();
          const now = Date.now();
          const doc: DocMeta = {
            id,
            toolId: "sipoc",
            title: diagram.title ?? "Proceso principal",
            createdAt: now,
            updatedAt: now,
          };

          set({
            docs: { [id]: doc },
            data: { [id]: diagram },
            _migrationDone: true,
          });

          localStorage.removeItem(LEGACY_KEY);
          return true;
        } catch {
          set({ _migrationDone: true });
          return false;
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        docs: state.docs,
        data: state.data,
        _migrationDone: state._migrationDone,
      }),
    },
  ),
);
