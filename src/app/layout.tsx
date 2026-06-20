import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "simple-sipoc",
  description: "Editor SIPOC minimalista basado en XML",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="mx-auto min-h-screen w-full max-w-7xl p-4 md:p-6">{children}</div>
      </body>
    </html>
  );
}
