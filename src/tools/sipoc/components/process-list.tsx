"use client";

import { useState } from "react";
import { Check, FolderTree, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SIPOCProcess } from "@/tools/sipoc/types";

interface ProcessListProps {
  processes: SIPOCProcess[];
  canEnterSubprocess: boolean;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
  onEnter: (id: string) => void;
}

export function ProcessList({
  processes,
  canEnterSubprocess,
  onAdd,
  onRemove,
  onEnter,
}: ProcessListProps) {
  const [value, setValue] = useState("");

  return (
    <Card className="min-h-0 h-full">
      <CardHeader>
        <CardTitle>Proceso</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Agregar paso del proceso"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") {
                return;
              }
              const trimmed = value.trim();
              if (!trimmed) {
                return;
              }
              onAdd(trimmed);
              setValue("");
            }}
          />
          <Button
            variant="outline"
            size="icon-sm"
            className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => {
              const trimmed = value.trim();
              if (!trimmed) {
                return;
              }
              onAdd(trimmed);
              setValue("");
            }}
            aria-label="Agregar paso del proceso"
            title="Agregar paso del proceso"
          >
            <Check className="size-4" />
          </Button>
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {processes.map((process) => (
            <li key={process.id} className="rounded-md border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span>{process.label}</span>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="shrink-0 border-sky-300 text-sky-700 hover:bg-sky-50"
                    onClick={() => onEnter(process.id)}
                    disabled={!canEnterSubprocess}
                    aria-label={process.child ? `Abrir sub-SIPOC de ${process.label}` : `Crear sub-SIPOC para ${process.label}`}
                    title={process.child ? `Abrir sub-SIPOC de ${process.label}` : `Crear sub-SIPOC para ${process.label}`}
                  >
                    <FolderTree className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    className="shrink-0 border-rose-300 text-rose-700 hover:bg-rose-50"
                    onClick={() => onRemove(process.id)}
                    aria-label={`Eliminar ${process.label}`}
                    title={`Eliminar ${process.label}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
          {processes.length === 0 ? <li className="text-sm text-muted-foreground">Sin procesos</li> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
