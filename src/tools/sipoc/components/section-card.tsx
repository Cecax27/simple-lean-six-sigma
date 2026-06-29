"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SIPOCItem } from "@/tools/sipoc/types";

interface SectionCardProps {
  title: string;
  items: SIPOCItem[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
}

export function SectionCard({ title, items, onAdd, onRemove }: SectionCardProps) {
  const [value, setValue] = useState("");

  return (
    <Card className="min-h-0 h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder={`Agregar ${title.toLowerCase()}`}
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
            aria-label={`Agregar ${title.toLowerCase()}`}
            title={`Agregar ${title.toLowerCase()}`}
          >
            <Check className="size-4" />
          </Button>
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
              <span>{item.label}</span>
              <Button
                size="icon-sm"
                variant="outline"
                className="shrink-0 border-rose-300 text-rose-700 hover:bg-rose-50"
                onClick={() => onRemove(item.id)}
                aria-label={`Eliminar ${item.label}`}
                title={`Eliminar ${item.label}`}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
          {items.length === 0 ? <li className="text-sm text-muted-foreground">Sin elementos</li> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
