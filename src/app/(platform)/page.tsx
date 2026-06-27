import Link from "next/link";
import { ArrowRight, GitBranch, Wrench } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolCard {
  href: string;
  label: string;
  description: string;
  status: "ready" | "soon";
}

const tools: ToolCard[] = [
  {
    href: "/sipoc",
    label: "SIPOC",
    description: "Diagramas de Proveedores, Entradas, Proceso, Salidas y Clientes con anidamiento hasta 3 niveles.",
    status: "ready",
  },
  {
    href: "/ishikawa",
    label: "Ishikawa",
    description: "Diagrama de causa-efecto (espina de pescado) para analisis de raiz de problemas.",
    status: "soon",
  },
  {
    href: "/pareto",
    label: "Pareto",
    description: "Analisis de Pareto para identificar las causas principales de un problema.",
    status: "soon",
  },
  {
    href: "/cinco-porques",
    label: "5 Porques",
    description: "Metodo de los 5 Porques para analisis de causa raiz paso a paso.",
    status: "soon",
  },
  {
    href: "/dmaic",
    label: "DMAIC",
    description: "Marco estructurado Definir, Medir, Analizar, Mejorar y Controlar.",
    status: "soon",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-6 py-4 md:py-6">
      {/* Hero */}
      <Card className="bg-card/90">
        <CardHeader className="space-y-2 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Plataforma Lean Six Sigma
          </p>
          <h1 className="text-2xl font-bold sm:text-3xl">
            Simple Lean Six Sigma
          </h1>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground sm:text-base">
            Olvidate de las plantillas en Excel o Word. Enfocate en los datos, desde cualquier lugar.
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-center gap-2">
          <Link className={buttonVariants()} href="/sipoc">
            Abrir SIPOC <ArrowRight className="ml-2 size-4" />
          </Link>
          <Link className={cn(buttonVariants({ variant: "outline" }))} href="/docs">
            Mis documentos
          </Link>
        </CardContent>
      </Card>

      {/* Tool grid */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Wrench className="size-5 text-primary" />
          Herramientas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.href} className={cn(tool.status === "soon" && "opacity-60")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{tool.label}</h3>
                  {tool.status === "soon" ? (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      Proximamente
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Disponible
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </CardContent>
              <CardFooter>
                {tool.status === "ready" ? (
                  <Link
                    href={tool.href}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                  >
                    Abrir {tool.label} <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                ) : (
                  <span className="w-full text-center text-xs text-muted-foreground">
                    Proximamente
                  </span>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* GitHub */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Link
          className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
          href="https://github.com/Cecax27/simple-lean-six-sigma"
          target="_blank"
          rel="noreferrer"
        >
          <GitBranch className="size-4" /> Proyecto en GitHub
        </Link>
        <p className="text-center text-xs text-muted-foreground">
          Open source (MIT). Codigo en ingles, interfaz en espanol.
        </p>
      </div>
    </div>
  );
}
