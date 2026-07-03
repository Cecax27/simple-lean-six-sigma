"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocsStore } from "@/store/docs-store";

export default function ProcessMapHomePage() {
  const router = useRouter();
  const createDoc = useDocsStore((state) => state.createDoc);

  function handleCreate() {
    const id = createDoc("mapa-proceso-extendido", "Nuevo mapa de proceso");
    router.push(`/mapa-proceso-extendido/${id}`);
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Mapa de Proceso Extendido</CardTitle>
          <CardDescription>
            Crea un nuevo mapa de proceso multicarril o abre uno existente desde
            Mis documentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreate} className="w-full gap-2">
            <Plus className="size-4" /> Nuevo mapa de proceso
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
