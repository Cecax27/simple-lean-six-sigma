import type { Metadata } from "next";

import "@/app/globals.css";
import { Geist } from "next/font/google";
import { Providers } from "@/app/providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Simple Lean Six Sigma",
  description: "Plataforma web minimalista para herramientas Lean Six Sigma",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <Providers>
          <div className="mx-auto min-h-screen w-full max-w-7xl p-4 md:p-6">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
