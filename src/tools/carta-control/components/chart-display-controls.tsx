"use client";

import { ZoomIn } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  parseDateLabel,
  pointsAreDates,
  pointsHaveTime,
} from "@/tools/carta-control/chart";
import type { ControlChartPoint } from "@/tools/carta-control/types";
import type { PointRange } from "@/tools/carta-control/components/control-chart-svg";

function toDateInputValue(date: Date, withTime: boolean): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const base = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  if (withTime) {
    return `${base}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  return base;
}

function initialDateRange(points: ControlChartPoint[], withTime: boolean): string[] {
  const timestamps = points
    .map((point) => parseDateLabel(point.label)?.getTime())
    .filter((value): value is number => value !== undefined && !Number.isNaN(value));
  if (timestamps.length === 0) {
    return ["", ""];
  }
  const from = toDateInputValue(new Date(Math.min(...timestamps)), withTime);
  const to = toDateInputValue(new Date(Math.max(...timestamps)), withTime);
  return [from, to];
}

interface DisplayControlsProps {
  points: ControlChartPoint[];
  onChange: (range: PointRange) => void;
}

export function DisplayControls({ points, onChange }: DisplayControlsProps) {
  const isDates = useMemo(() => pointsAreDates(points), [points]);
  const withTime = useMemo(() => pointsHaveTime(points), [points]);

  const [initialFrom, initialTo] = useMemo(
    () => initialDateRange(points, withTime),
    [points, withTime],
  );

  const [dateFrom, setDateFrom] = useState<string>(initialFrom);
  const [dateTo, setDateTo] = useState<string>(initialTo);
  const [idxFrom, setIdxFrom] = useState<number>(1);
  const [idxTo, setIdxTo] = useState<number>(points.length || 1);
  const [zoom, setZoom] = useState<number>(points.length || 1);
  const [pan, setPan] = useState<number>(0);

  const filteredIndices = useMemo(() => {
    return points
      .map((point, index) => ({
        index,
        timestamp: parseDateLabel(point.label)?.getTime() ?? null,
      }))
      .filter((entry) => {
        if (isDates) {
          if (entry.timestamp === null) return false;
          if (dateFrom) {
            const from = new Date(dateFrom).getTime();
            if (entry.timestamp < from) return false;
          }
          if (dateTo) {
            const to = new Date(dateTo).getTime();
            if (entry.timestamp > to) return false;
          }
          return true;
        }
        const oneBased = entry.index + 1;
        return oneBased >= idxFrom && oneBased <= idxTo;
      })
      .map((entry) => entry.index);
  }, [points, isDates, dateFrom, dateTo, idxFrom, idxTo]);

  const total = filteredIndices.length;
  const safeZoom = Math.min(Math.max(1, zoom), Math.max(1, total));
  const safePan = Math.min(Math.max(0, pan), Math.max(0, total - safeZoom));

  useEffect(() => {
    if (total === 0) {
      onChange({ start: 0, end: -1 });
      return;
    }
    const start = filteredIndices[safePan];
    const end = filteredIndices[safePan + safeZoom - 1];
    onChange({ start, end });
  }, [filteredIndices, safeZoom, safePan, total, onChange]);

  if (points.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      {isDates ? (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Desde
            </label>
            <Input
              type={withTime ? "datetime-local" : "date"}
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-8 w-auto text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Hasta
            </label>
            <Input
              type={withTime ? "datetime-local" : "date"}
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-8 w-auto text-sm"
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Desde
            </label>
            <Input
              type="number"
              min={1}
              max={points.length}
              step={1}
              value={idxFrom}
              onChange={(event) =>
                setIdxFrom(Math.max(1, Number(event.target.value) || 1))
              }
              className="h-8 w-24 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground">
              Hasta
            </label>
            <Input
              type="number"
              min={1}
              max={points.length}
              step={1}
              value={idxTo}
              onChange={(event) =>
                setIdxTo(Math.min(points.length, Number(event.target.value) || points.length))
              }
              className="h-8 w-24 text-sm"
            />
          </div>
        </>
      )}

      <div className="flex min-w-44 flex-1 items-center gap-3">
        <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
        <Slider
          value={[safeZoom]}
          min={1}
          max={Math.max(1, total)}
          onValueChange={(value) => {
            const next = Array.isArray(value) ? value[0] : (value as number);
            setZoom(next);
          }}
          aria-label="Zoom del eje X"
          className="max-w-52"
        />
        <span className="shrink-0 text-xs text-muted-foreground">
          {safeZoom} / {total} puntos
        </span>
      </div>

      {total > safeZoom ? (
        <div className="flex min-w-44 flex-1 items-center gap-3">
          <Slider
            value={[safePan]}
            min={0}
            max={Math.max(0, total - safeZoom)}
            onValueChange={(value) => {
              const next = Array.isArray(value) ? value[0] : (value as number);
              setPan(next);
            }}
            aria-label="Desplazamiento del eje X"
            className="max-w-52"
          />
          <span className="shrink-0 text-xs text-muted-foreground">
            {safePan + 1}–{safePan + safeZoom}
          </span>
        </div>
      ) : null}
    </div>
  );
}
