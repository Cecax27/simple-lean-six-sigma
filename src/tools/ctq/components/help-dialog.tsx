"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  ListChecks,
  Target,
} from "lucide-react";
import { useState } from "react";

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
import { ctqTooltips } from "@/tools/ctq/ctq-tooltips";

export function HelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Target className="size-5 text-primary" />
            Arbol CTQ (Critical-to-Quality)
          </DialogTitle>
          <DialogDescription className="text-sm">
            Guia de referencia para construir un arbol de necesidades criticas del cliente.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Que es */}
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Target className="size-4 text-primary" />
            Que es el Arbol CTQ
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            El arbol CTQ (Critical-to-Quality) es una herramienta visual que descompone las necesidades del cliente en impulsores y requisitos medibles. Permite traducir la voz del cliente (VOC) en caracteristicas especificas y cuantificables del producto o servicio.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            El arbol se organiza en tres niveles jerarquicos, de izquierda a derecha: necesidades (generales), impulsores (mas detallados, no necesariamente medibles) y requisitos (especificos y medibles).
          </p>
        </section>

        <Separator className="my-3" />

        {/* Cuando */}
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ChevronRight className="size-4 text-primary" />
            Cuando usar el Arbol CTQ
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Cuando necesitas traducir necesidades del cliente en requisitos medibles.",
              "En la fase de Definicion (D) de un proyecto DMAIC.",
              "Para alinear al equipo sobre que es realmente importante para el cliente.",
              "Como paso previo al diseno de indicadores de calidad.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-3" />

        {/* Por que */}
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Lightbulb className="size-4 text-primary" />
            Por que usar esta herramienta
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Asegura que los requisitos del producto o servicio esten directamente vinculados a las necesidades del cliente.",
              "Facilita la comunicacion entre el cliente y el equipo de desarrollo.",
              "Permite establecer metas medibles para la mejora de calidad.",
              "Ayuda a identificar los impulsores clave que afectan la satisfaccion del cliente.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-3" />

        {/* Pasos */}
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks className="size-4 text-primary" />
            Como construir un arbol CTQ (3 pasos)
          </h3>
          <ol className="mt-1.5 space-y-3">
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                1
              </span>
              <div>
                <span className="font-medium">Crear la lista de necesidades criticas del cliente.</span>
                <span className="text-muted-foreground">
                  {" "}
                  Identifica y enumera las necesidades que son criticas para el cliente. Define cada una en terminos generales. Responde a la pregunta: &ldquo;Que es importante para el cliente?&rdquo;
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                2
              </span>
              <div>
                <span className="font-medium">Definir los impulsores para cada necesidad.</span>
                <span className="text-muted-foreground">
                  {" "}
                  Para cada necesidad, identifica los impulsores. Los impulsores son el punto de transicion entre las necesidades del cliente y los requisitos. No necesitan ser medibles, pero deben ser mas detallados que las necesidades.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                3
              </span>
              <div>
                <span className="font-medium">Establecer los requisitos para cada impulsor.</span>
                <span className="text-muted-foreground">
                  {" "}
                  Finalmente, para cada impulsor, lista los requisitos. Estos son el desglose mas detallado de las caracteristicas criticas para la calidad. Deben ser medibles y especificos para poder evaluar si se cumplen.
                </span>
              </div>
            </li>
          </ol>
        </section>

        <Separator className="my-3" />

        {/* Niveles */}
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks className="size-4 text-primary" />
            Niveles del arbol
          </h3>
          <div className="mt-2 grid gap-2">
            {[
              { key: "need", label: ctqTooltips.need.label, tip: ctqTooltips.need.tip },
              { key: "driver", label: ctqTooltips.driver.label, tip: ctqTooltips.driver.tip },
              { key: "requirement", label: ctqTooltips.requirement.label, tip: ctqTooltips.requirement.tip },
            ].map(({ key, label, tip }) => (
              <div key={key} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs font-semibold">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-3" />

        {/* Buenas practicas */}
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-primary" />
            Buenas practicas
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Trabaja una necesidad a la vez para construir el arbol. No intentes llenar todas las columnas simultaneamente.",
              "Los impulsores no necesitan ser medibles, pero los requisitos si. Asegurate de que cada requisito pueda ser evaluado objetivamente.",
              "Si un impulsor tiene muchos requisitos (mas de 5-7), considera si puedes subdividirlo en impulsores mas especificos.",
              "Involucra al cliente en la definicion de necesidades. La voz del cliente (VOC) es esencial para un arbol CTQ efectivo.",
              "Revisa el arbol periodicamente. Las necesidades del cliente pueden cambiar con el tiempo.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}
