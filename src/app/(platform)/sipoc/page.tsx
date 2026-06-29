"use client";

import { ArrowRight, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocsStore } from "@/store/docs-store";

export default function SipocHomePage() {
  const router = useRouter();
  const createDoc = useDocsStore((state) => state.createDoc);

  function handleCreate() {
    const id = createDoc("sipoc", "Nuevo diagrama SIPOC");
    router.push(`/sipoc/${id}`);
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>SIPOC</CardTitle>
          <CardDescription>
            Crea un nuevo diagrama SIPOC o abre uno existente desde Mis documentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCreate} className="w-full gap-2">
            <Plus className="size-4" /> Nuevo diagrama SIPOC
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
