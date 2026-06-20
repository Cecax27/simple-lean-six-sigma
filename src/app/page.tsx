import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="grid min-h-[80vh] place-items-center">
      <section className="w-full max-w-2xl rounded-xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">Simple SIPOC</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Crea diagramas SIPOC sin pelearte con plantillas de Word o Excel.
        </p>
        <div className="mt-6">
          <Link className={buttonVariants()} href="/editor">
            Abrir editor
          </Link>
        </div>
      </section>
    </main>
  );
}
