"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { usePreferencesStore } from "@/store/preferences-store";
import type { ThemePreference } from "@/types/preferences";

export function SettingsPanel() {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = usePreferencesStore((state) => state.setSidebarCollapsed);

  return (
    <div className="space-y-6 p-4">
      <section className="space-y-3">
        <Label htmlFor="theme-select">Tema</Label>
        <Select value={theme} onValueChange={(value) => setTheme(value as ThemePreference)}>
          <SelectTrigger id="theme-select" className="w-full sm:w-64">
            <SelectValue placeholder="Selecciona un tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">Sistema (predeterminado)</SelectItem>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Oscuro</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          La opcion sistema sigue automaticamente la configuracion de tu dispositivo.
        </p>
      </section>

      <Separator />

      <section className="flex items-center justify-between gap-4 rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Menu lateral colapsado por defecto</p>
          <p className="text-xs text-muted-foreground">Puedes cambiarlo tambien desde el propio menu en el editor.</p>
        </div>
        <Switch checked={sidebarCollapsed} onCheckedChange={setSidebarCollapsed} aria-label="Colapsar menu lateral por defecto" />
      </section>
    </div>
  );
}
