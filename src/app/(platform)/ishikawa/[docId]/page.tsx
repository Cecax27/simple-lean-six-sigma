"use client";

import { ArrowLeft, Construction } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IshikawaPage() {
  return (
    <div className="flex min-h-full items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <Construction className="mx-auto size-10 text-muted-foreground" />
          <CardTitle className="mt-3">Ishikawa</CardTitle>
          <CardDescription>
            Diagrama de causa-efecto (espina de pescado) para analisis de raiz de problemas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Proximamente disponible.</p>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="size-4" /> Volver al inicio
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
