import type { Metadata } from "next";

import "@/app/globals.css";
import { Geist } from "next/font/google";
import { Providers } from "@/app/providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Simple Lean Six Sigma",
  description: "Plataforma web minimalista para herramientas Lean Six Sigma",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
