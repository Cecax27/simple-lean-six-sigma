"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LaneManagerProps {
  title: string;
  items: { id: string; name: string }[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

export function LaneManager({
  title,
  items,
  onAdd,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: LaneManagerProps) {
  const [newName, setNewName] = useState("");

  function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setNewName("");
  }

  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-sm font-medium mb-3">{title}</h3>

      <div className="space-y-2 mb-3">
        {items.length === 0 && (
          <p className="text-xs text-muted-foreground py-2 text-center">
            Sin elementos
          </p>
        )}
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-1.5 group"
          >
            <GripVertical className="size-3.5 text-muted-foreground shrink-0" />
            <Input
              value={item.name}
              onChange={(e) => onUpdate(item.id, e.target.value)}
              className="h-8 text-xs flex-1"
              placeholder="Nombre"
            />
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={idx === 0}
                onClick={() => onMoveUp(item.id)}
              >
                <ArrowUp className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={idx === items.length - 1}
                onClick={() => onMoveDown(item.id)}
              >
                <ArrowDown className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-destructive hover:text-destructive"
                onClick={() => onRemove(item.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          placeholder={
            title.includes("Departamento")
              ? "Nuevo departamento"
              : "Nueva etapa"
          }
          className="h-8 text-xs"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs shrink-0"
          onClick={handleAdd}
          disabled={!newName.trim()}
        >
          Agregar
        </Button>
      </div>
    </div>
  );
}
