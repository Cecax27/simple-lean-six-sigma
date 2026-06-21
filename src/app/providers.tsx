"use client";

import { useEffect } from "react";

import { usePreferencesStore } from "@/store/preferences-store";
import type { ThemePreference } from "@/types/preferences";

function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return preference;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = usePreferencesStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const activeTheme = resolveTheme(theme);
      root.classList.toggle("dark", activeTheme === "dark");
      root.style.colorScheme = activeTheme;
    };

    applyTheme();

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => applyTheme();
    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, [theme]);

  return <>{children}</>;
}
