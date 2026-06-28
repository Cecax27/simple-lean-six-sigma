"use client";

import { BookOpen, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDocsStore } from "@/store/docs-store";

export default function CtqHomePage() {
  const router = useRouter();
  const createDoc = useDocsStore((s) => s.createDoc);

  function handleCreate() {
    const id = createDoc("ctq", "Nuevo arbol CTQ");
    router.push(`/ctq/${id}`);
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Arbol CTQ</CardTitle>
          <CardDescription>
            Arbol de necesidades criticas del cliente, impulsores y requisitos
            (Critical-to-Quality) en formato horizontal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreate} className="w-full gap-2">
            <Plus className="size-4" /> Nuevo arbol CTQ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
