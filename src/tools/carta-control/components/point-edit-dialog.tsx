"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCartaControlStore } from "@/tools/carta-control/store";
import type { ControlChartPoint } from "@/tools/carta-control/types";

interface PointEditDialogProps {
  point: ControlChartPoint;
  onClose: () => void;
}

export function PointEditDialog({ point, onClose }: PointEditDialogProps) {
  const updatePoint = useCartaControlStore((state) => state.updatePoint);

  const [label, setLabel] = useState(point.label);
  const [value, setValue] = useState(String(point.value));
  const [comment, setComment] = useState(point.comment ?? "");

  function handleSave() {
    const parsed = Number(value.trim().replace(",", "."));
    if (Number.isFinite(parsed)) {
      updatePoint(point.id, {
        label,
        value: parsed,
        comment: comment.trim() || undefined,
      });
    }
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar punto</DialogTitle>
          <DialogDescription>
            Modifica la etiqueta, el valor y el comentario de este punto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Etiqueta
            </label>
            <Input value={label} onChange={(event) => setLabel(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Valor
            </label>
            <Input
              type="number"
              step="any"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Comentario
            </label>
            <Textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Nota visible solo al enfocar el punto..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!value.trim()}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
