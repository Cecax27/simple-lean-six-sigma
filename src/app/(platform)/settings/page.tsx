"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { usePreferencesStore } from "@/store/preferences-store";
import type { ThemePreference } from "@/types/preferences";

export default function SettingsPage() {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = usePreferencesStore((state) => state.setSidebarCollapsed);

  return (
    <div className="space-y-6 py-4 md:py-6">
      <div>
        <h1 className="text-xl font-bold">Ajustes</h1>
        <p className="text-sm text-muted-foreground">
          Personaliza la apariencia y comportamiento de la plataforma.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
          <CardDescription>Configura el tema visual de la aplicacion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
              <p className="text-xs text-muted-foreground">
                Puedes cambiarlo tambien desde el propio menu lateral.
              </p>
            </div>
            <Switch
              checked={sidebarCollapsed}
              onCheckedChange={setSidebarCollapsed}
              aria-label="Colapsar menu lateral por defecto"
            />
          </section>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link href="/inicio" className={cn(buttonVariants({ variant: "outline" }))}>
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
