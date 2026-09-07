"use client";

import {
  Activity,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  LineChart,
  Lightbulb,
  ListChecks,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50">
            <BookOpen className="size-4" /> Documentacion
          </Button>
        }
      />
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <LineChart className="size-5 text-primary" />
            Carta de Control
          </DialogTitle>
          <DialogDescription className="text-sm">
            Guia de referencia basada en Six Sigma Study Guide &mdash; Walter A. Shewhart (1924).
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Activity className="size-4 text-primary" />
            Que es una Carta de Control
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            La carta de control (o grafico de control) es una herramienta de Control
            Estadistico de Procesos (SPC) que muestra como cambia un proceso a lo largo del
            tiempo. Los datos se grafican en orden cronologico, junto con una linea central
            (el promedio) y limites de control superior e inferior.
          </p>
        </section>

        <Separator className="my-3" />

        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ChevronRight className="size-4 text-primary" />
            Cuando usar una Carta de Control
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Para controlar procesos y verificar que se mantienen dentro de limites.",
              "Para supervisar procesos criticos con mediciones continuas.",
              "Para distinguir entre variacion por causa comun y causa especial.",
              "Para prevenir defectos en lugar de detectarlos despues del hecho.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-3" />

        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks className="size-4 text-primary" />
            Como construir una Carta de Control
          </h3>
          <ol className="mt-1.5 space-y-2">
            {[
              "Elige las caracteristicas de calidad a medir.",
              "Recolecta los datos en orden cronologico (por lote, turno o tiempo).",
              "Calcula la linea central como el promedio de los datos.",
              "Define los limites de control superior (LCS) e inferior (LCI).",
              "Grafica los puntos y añade comentarios cuando ocurra algo relevante.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </section>

        <Separator className="my-3" />

        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Lightbulb className="size-4 text-primary" />
            Como interpretar la carta
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Un punto fuera de los limites indica una causa especial y se resalta en rojo.",
              "Rachas: 7 o mas puntos consecutivos al mismo lado de la linea central.",
              "Tendencias: 6 o mas puntos en aumento o disminucion continuos.",
              "Ciclos: patrones repetitivos que sugieren una causa sistemica.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            Consejo: usa los comentarios por punto para documentar investigaciones o causas
            cuando un punto salga de control. Los comentarios solo se ven al enfocar el punto.
          </p>
        </section>
      </DialogContent>
    </Dialog>
  );
}
