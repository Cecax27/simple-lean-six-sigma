import Link from "next/link";
import { GitBranch, HeartHandshake } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <main className="grid min-h-[80vh] place-items-center py-6">
      <Card className="w-full max-w-3xl bg-card/90">
        <CardHeader className="space-y-3 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Editor SIPOC</p>
          <CardTitle className="text-3xl sm:text-4xl">Simple SIPOC</CardTitle>
          <CardDescription className="mx-auto max-w-xl text-sm sm:text-base">
            Crea diagramas SIPOC en minutos, con soporte de anidamiento, importacion XML y exportacion visual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link className={buttonVariants()} href="/editor">
              Abrir editor
            </Link>
            <Link className={cn(buttonVariants({ variant: "outline" }))} href="/settings">
              Configuraciones
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
              href="https://github.com/Cecax27/simple-sipoc"
              target="_blank"
              rel="noreferrer"
            >
              <GitBranch className="size-4" /> Proyecto en GitHub
            </Link>
            <Link
              className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
              href="https://github.com/sponsors/Cecax27"
              target="_blank"
              rel="noreferrer"
            >
              <HeartHandshake className="size-4" /> Donaciones
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Interfaz en espanol, guardado local y enfoque en trabajo rapido.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
