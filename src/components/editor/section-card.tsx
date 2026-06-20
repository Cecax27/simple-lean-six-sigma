"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SIPOCItem } from "@/types/sipoc";

interface SectionCardProps {
  title: string;
  items: SIPOCItem[];
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
}

export function SectionCard({ title, items, onAdd, onRemove }: SectionCardProps) {
  const [value, setValue] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
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
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
              <span>{item.label}</span>
              <Button size="sm" variant="ghost" onClick={() => onRemove(item.id)}>
                Quitar
              </Button>
            </li>
          ))}
          {items.length === 0 ? <li className="text-sm text-muted-foreground">Sin elementos</li> : null}
        </ul>
      </CardContent>
    </Card>
  );
}
