"use client";

import {
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Fish,
  Lightbulb,
  ListChecks,
  Target,
  Users,
  Wrench,
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
import { cn } from "@/lib/utils";
import { ishikawaTooltips } from "@/tools/ishikawa/ishikawa-tooltips";

const SECTIONS = [
  { id: "que-es", label: "Que es" },
  { id: "cuando", label: "Cuando usarlo" },
  { id: "por-que", label: "Por que usarlo" },
  { id: "pasos", label: "Como construirlo" },
  { id: "categorias", label: "Las 6M" },
  { id: "buenas-practicas", label: "Buenas practicas" },
];

export function HelpDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 border-blue-300 text-blue-700 hover:bg-blue-50">
          <BookOpen className="size-4" /> Documentacion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Fish className="size-5 text-primary" />
            Diagrama de Causa y Efecto (Ishikawa)
          </DialogTitle>
          <DialogDescription className="text-sm">
            Guia de referencia basada en Six Sigma Study Guide &mdash; Kaoru Ishikawa (1968).
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Que es */}
        <section id="que-es">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Target className="size-4 text-primary" />
            Que es el Diagrama de Ishikawa
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            El Diagrama de Causa y Efecto (tambien llamado Ishikawa, espina de pescado o
            fishbone) es una representacion visual que muestra las posibles causas de un
            problema o efecto especifico. Fue introducido por Kaoru Ishikawa en 1968 y es
            una de las siete herramientas basicas de calidad.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            El diagrama se parece al esqueleto de un pescado: una linea horizontal central
            (la espina), con la cabeza a la derecha donde se coloca el efecto, y espinas
            grandes que representan las categorias principales de causas. De cada espina
            principal salen espinas mas pequeñas con las causas especificas.
          </p>
        </section>

        <Separator className="my-3" />

        {/* Cuando */}
        <section id="cuando">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ChevronRight className="size-4 text-primary" />
            Cuando usar el Diagrama de Ishikawa
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Cuando un problema tiene multiples causas posibles.",
              "Para identificar las posibles causas raiz de un efecto.",
              "Para identificar y ordenar interacciones entre los factores que influyen en un efecto.",
              "Para iniciar acciones correctivas apropiadas sobre problemas existentes.",
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
        <section id="por-que">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Lightbulb className="size-4 text-primary" />
            Por que usar este diagrama
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Es un paso esencial para estudiar un problema y determinar la causa raiz.",
              "Permite analizar todas las causas probables por las que un proceso empieza a fallar.",
              "Ayuda a identificar areas donde recolectar datos para estudios posteriores.",
              "Fomenta el trabajo en equipo y la lluvia de ideas (brainstorming).",
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
        <section id="pasos">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ListChecks className="size-4 text-primary" />
            Como construir un diagrama de Ishikawa (5 pasos)
          </h3>
          <ol className="mt-1.5 space-y-2">
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                1
              </span>
              <div>
                <span className="font-medium">Identificar el problema.</span>
                <span className="text-muted-foreground">
                  {" "}
                  Escribe claramente el efecto o problema a analizar (la cabeza del
                  pescado). Crea una definicion operativa para que todos los involucrados
                  la entiendan. El efecto puede ser negativo (un problema) o positivo (un
                  objetivo de mejora).
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                2
              </span>
              <div>
                <span className="font-medium">Dibujar la espina y la cabeza.</span>
                <span className="text-muted-foreground">
                  {" "}
                  Traza una linea horizontal (la espina) y al final derecho una caja con
                  la descripcion del efecto o problema.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                3
              </span>
              <div>
                <span className="font-medium">
                  Identificar las causas principales (las 6M).
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  Establece las causas mayores en forma de espinas grandes que llegan a la
                  espina central. Usa las 6M como referencia y coloca algunas por encima y
                  otras por debajo de la linea horizontal.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                4
              </span>
              <div>
                <span className="font-medium">Identificar las sub-causas.</span>
                <span className="text-muted-foreground">
                  {" "}
                  Para cada causa principal, identifica tantas sub-causas como sea posible
                  y ubicalas como espinas mas pequeñas debajo de cada categoria principal.
                  Si una sub-causa aplica en varios lugares, listala en cada uno.
                </span>
              </div>
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                5
              </span>
              <div>
                <span className="font-medium">Analizar el diagrama.</span>
                <span className="text-muted-foreground">
                  {" "}
                  El diagrama muestra todas las causas posibles. Identifica aquellas que no
                  estan impactando realmente el efecto y aquellas que necesitan mayor
                  investigacion. Luego realiza un analisis de los 5 Porques sobre las
                  causas identificadas para llegar a la causa raiz.
                </span>
              </div>
            </li>
          </ol>
        </section>

        <Separator className="my-3" />

        {/* Las 6M */}
        <section id="categorias">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Wrench className="size-4 text-primary" />
            Las 6M (Categorias principales)
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tambien conocidas como 5Ms y 1P. Son las categorias estandar usadas para
            agrupar las causas:
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {[
              { key: "manodeobra", icon: Users },
              { key: "metodos", icon: ListChecks },
              { key: "maquinas", icon: Wrench },
              { key: "materiales", icon: CheckCircle2 },
              { key: "mediciones", icon: Target },
              { key: "entorno", icon: Brain },
            ].map(({ key, icon: Icon }) => {
              const tip = ishikawaTooltips[`category_${key}`];
              return (
                <div
                  key={key}
                  className="rounded-lg border bg-muted/30 p-3"
                >
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    <Icon className="size-3.5 text-primary" />
                    {tip?.label ?? key}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {tip?.tip ?? ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <Separator className="my-3" />

        {/* Buenas practicas */}
        <section id="buenas-practicas">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <CheckCircle2 className="size-4 text-primary" />
            Buenas practicas
          </h3>
          <ul className="mt-1.5 space-y-1">
            {[
              "Enfocate en las causas, no en las soluciones. El diagrama es para identificar que causa el problema, no como resolverlo.",
              "No te quedes en lo superficial. Profundiza hasta encontrar las causas raiz. Pregunta \"por que\" repetidamente.",
              "El diagrama es mas util cuando se construye en equipo. Involucra a personas de distintas areas para tener multiples perspectivas.",
              "No descartes causas solo porque parecen improbables. En esta etapa, el objetivo es la cantidad de ideas, no la calidad.",
              "Pregunta \"por que\" hasta que sea absurdo continuar (5 Porques).",
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
