import Link from "next/link";
import {
  ArrowRight,
  Code2,
  GitFork,
  Heart,
  MousePointerClick,
  Sparkles,
  Wrench,
} from "lucide-react";

import { buttonVariants, Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TOOLS } from "@/tools/registry";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-sm font-semibold">Simple Lean Six Sigma</span>
          <nav className="flex items-center gap-2">
            <Link
              href="/inicio"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Entrar
            </Link>
            <Link
              href="https://github.com/Cecax27/simple-lean-six-sigma"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
            >
              <GitFork className="size-3.5" /> GitHub
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3 text-primary" />
            Open Source y gratuito
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple Lean Six Sigma
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Una plataforma web minimalista para herramientas Lean Six Sigma.
            Olvidate de las plantillas en Excel o Word. Enfocate en los datos,
            desde cualquier lugar.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/inicio"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Empezar ahora <ArrowRight className="size-4" />
            </Link>
            <a
              href="https://github.com/sponsors/Cecax27"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <Heart className="size-4 text-red-500" /> Hacer una donacion
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold">
            Por que Simple Lean Six Sigma
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 text-center">
              <Code2 className="mx-auto size-8 text-primary" />
              <h3 className="mt-3 font-semibold">Open Source</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Codigo abierto bajo licencia MIT. Sin costos ocultos, sin
                suscripciones. Totalmente gratuito para siempre.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center">
              <MousePointerClick className="mx-auto size-8 text-primary" />
              <h3 className="mt-3 font-semibold">Simple de usar</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Interfaz minimalista e intuitiva. Sin configuraciones
                complicadas. Solo abri y empeza a trabajar.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6 text-center">
              <Wrench className="mx-auto size-8 text-primary" />
              <h3 className="mt-3 font-semibold">Herramientas esenciales</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                SIPOC, Ishikawa, Pareto, 5 Porques y DMAIC. Las herramientas
                fundamentales de Lean Six Sigma en un solo lugar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="border-t px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold">
            Que podes hacer
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Todas las herramientas que necesitas para tus proyectos de mejora
            continua.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                className={cn(
                  "rounded-xl border bg-card p-5",
                  tool.status === "soon" && "opacity-60",
                )}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{tool.nameEs}</h3>
                  {tool.status === "ready" ? (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      Disponible
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Proximamente
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {tool.descriptionEs}
                </p>
                {tool.status === "ready" ? (
                  <Link
                    href={tool.hrefBase}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "mt-4 w-full",
                    )}
                  >
                    Abrir {tool.nameEs} <ArrowRight className="ml-1 size-3.5" />
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t px-4 py-16 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Empeza ahora</h2>
          <p className="mt-3 text-muted-foreground">
            Sin necesidad de registrarte. Sin instalar nada. Todo funciona en tu
            navegador.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/inicio"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              Ir al panel <ArrowRight className="size-4" />
            </Link>
            <Link
              href="https://github.com/Cecax27/simple-lean-six-sigma"
              target="_blank"
              rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <GitFork className="size-4" /> Ver en GitHub
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
          <p>Simple Lean Six Sigma &mdash; Open Source (MIT)</p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/Cecax27/simple-lean-six-sigma"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors"
            >
              <GitFork className="size-4" />
            </Link>
            <a
              href="https://github.com/sponsors/Cecax27"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <Heart className="size-3.5" /> Donar
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
