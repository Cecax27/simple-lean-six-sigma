export type ThemePreference = "light" | "dark" | "system";

export interface PreferencesSnapshot {
  theme: ThemePreference;
  sidebarCollapsed: boolean;
}
