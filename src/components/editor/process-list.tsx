"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SIPOCProcess } from "@/types/sipoc";

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
    <Card>
      <CardHeader>
        <CardTitle>Proceso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
            size="sm"
            onClick={() => {
              const trimmed = value.trim();
              if (!trimmed) {
                return;
              }
              onAdd(trimmed);
              setValue("");
            }}
          >
            Agregar
          </Button>
        </div>

        <ul className="space-y-2">
          {processes.map((process) => (
            <li key={process.id} className="space-y-2 rounded-md border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span>{process.label}</span>
                <Button size="sm" variant="ghost" onClick={() => onRemove(process.id)}>
                  Quitar
                </Button>
              </div>
              <Button size="sm" variant="outline" onClick={() => onEnter(process.id)} disabled={!canEnterSubprocess}>
                {process.child ? "Abrir sub-SIPOC" : "Crear sub-SIPOC"}
              </Button>
            </li>
          ))}
          {processes.length === 0 ? <li className="text-sm text-muted-foreground">Sin procesos</li> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
