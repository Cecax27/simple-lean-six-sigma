"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PreferencesSnapshot, ThemePreference } from "@/types/preferences";

const STORAGE_KEY = "simple-lss-preferences-v1";
const LEGACY_KEY = "simple-sipoc-preferences-v1";

function migratePreferences(): void {
  if (typeof window === "undefined") return;

  try {
    if (localStorage.getItem(STORAGE_KEY)) return;

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (!legacy) return;

    const parsed = JSON.parse(legacy);
    if (parsed?.state) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    // Silently skip if migration fails
  }
}

interface PreferencesStore extends PreferencesSnapshot {
  setTheme: (theme: ThemePreference) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarCollapsed: false,
      setTheme: (theme) => set({ theme }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  migratePreferences();
}
