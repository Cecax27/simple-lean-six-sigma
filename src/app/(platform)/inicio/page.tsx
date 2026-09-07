import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TOOL_CATEGORIES, TOOLS, getToolsByStatus } from "@/tools/registry";

export default function InicioPage() {
  const readyTools = getToolsByStatus("ready");
  const firstReady = readyTools[0];

  return (
    <div className="space-y-8 py-4 md:py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Simple Lean Six Sigma</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Olvidate de las plantillas en Excel o Word. Enfocate en los datos, desde cualquier lugar.
          </p>
        </div>
        {firstReady ? (
          <Link className={buttonVariants({ size: "sm" })} href={firstReady.hrefBase}>
            Abrir {firstReady.nameEs} <ArrowRight className="ml-1.5 size-4" />
          </Link>
        ) : null}
      </div>

      {/* Tool grid, grouped by category */}
      <div className="space-y-8">
        {TOOL_CATEGORIES.map((category) => {
          const tools = TOOLS.filter((tool) => tool.category === category.id);
          if (tools.length === 0) return null;
          return (
            <section key={category.id} className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">{category.labelEs}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                  <Card key={tool.id} className={cn(tool.status === "soon" && "opacity-60")}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{tool.nameEs}</h3>
                        {tool.status === "soon" ? (
                          <span className="text-[11px] text-muted-foreground">Proximamente</span>
                        ) : null}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm text-muted-foreground">{tool.descriptionEs}</p>
                    </CardContent>
                    <CardFooter>
                      {tool.status === "ready" ? (
                        <Link
                          href={tool.hrefBase}
                          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full")}
                        >
                          Abrir {tool.nameEs} <ArrowRight className="ml-1 size-3.5" />
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
            </section>
          );
        })}
      </div>
    </div>
  );
}
