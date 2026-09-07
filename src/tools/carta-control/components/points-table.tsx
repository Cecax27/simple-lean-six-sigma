"use client";

import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isPointOutOfControl } from "@/tools/carta-control/chart";
import { cartaControlTooltips } from "@/tools/carta-control/carta-control-tooltips";
import { useCartaControlStore } from "@/tools/carta-control/store";
import type { ControlChart, ControlChartPoint } from "@/tools/carta-control/types";

interface PointsTableProps {
  points: ControlChartPoint[];
  chart: ControlChart;
  onEdit: (point: ControlChartPoint) => void;
}

export function PointsTable({ points, chart, onEdit }: PointsTableProps) {
  const addPoint = useCartaControlStore((state) => state.addPoint);
  const updatePoint = useCartaControlStore((state) => state.updatePoint);
  const removePoint = useCartaControlStore((state) => state.removePoint);
  const movePointUp = useCartaControlStore((state) => state.movePointUp);
  const movePointDown = useCartaControlStore((state) => state.movePointDown);

  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  function handleAdd() {
    const value = Number(newValue.trim().replace(",", "."));
    if (!Number.isFinite(value)) return;
    addPoint(newLabel, value);
    setNewLabel("");
    setNewValue("");
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Puntos</h3>

      {points.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay puntos. Agrega mediciones o importa un CSV para empezar.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
              <th className="py-1.5 pr-2 font-semibold">#</th>
              <th className="py-1.5 pr-2 font-semibold">
                {cartaControlTooltips.point_label.label}
              </th>
              <th className="py-1.5 pr-2 font-semibold">
                {cartaControlTooltips.point_value.label}
              </th>
              <th className="py-1.5 pr-2 font-semibold">
                {cartaControlTooltips.point_comment.label}
              </th>
              <th className="py-1.5 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point, index) => {
              const out = isPointOutOfControl(point, chart);
              return (
                <tr key={point.id} className="border-b last:border-b-0">
                  <td className="py-1 pr-2 text-muted-foreground">{index + 1}</td>
                  <td className="py-1 pr-2">
                    <Input
                      value={point.label}
                      placeholder={`Punto ${index + 1}`}
                      onChange={(event) =>
                        updatePoint(point.id, { label: event.target.value })
                      }
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="py-1 pr-2">
                    <Input
                      type="number"
                      step="any"
                      value={point.value}
                      onChange={(event) => {
                        const parsed = Number(event.target.value);
                        if (Number.isFinite(parsed)) {
                          updatePoint(point.id, { value: parsed });
                        }
                      }}
                      className={`h-8 text-sm ${out ? "text-rose-600 dark:text-rose-400" : ""}`}
                    />
                  </td>
                  <td className="max-w-[16rem] py-1 pr-2">
                    {point.comment ? (
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-xs text-muted-foreground">
                          {point.comment}
                        </span>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="inline-flex cursor-default">
                              <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs whitespace-pre-wrap">{point.comment}</p>
                          </TooltipContent>
                        </Tooltip>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="py-1">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => movePointUp(point.id)}
                        aria-label="Subir punto"
                      >
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => movePointDown(point.id)}
                        aria-label="Bajar punto"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(point)}
                        aria-label="Editar punto"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-rose-600 hover:text-rose-700"
                        onClick={() => removePoint(point.id)}
                        aria-label="Eliminar punto"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t pt-3">
        <Input
          value={newLabel}
          onChange={(event) => setNewLabel(event.target.value)}
          placeholder="Etiqueta"
          className="h-8 max-w-xs text-sm"
        />
        <Input
          type="number"
          step="any"
          value={newValue}
          onChange={(event) => setNewValue(event.target.value)}
          placeholder="Valor"
          className="h-8 max-w-[8rem] text-sm"
        />
        <Button
          variant="outline"
          size="sm"
          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
          onClick={handleAdd}
          disabled={!newValue.trim()}
        >
          <Plus className="mr-1 size-4" /> Agregar
        </Button>
      </div>
    </div>
  );
}
