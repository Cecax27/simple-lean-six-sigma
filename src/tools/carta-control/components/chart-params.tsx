"use client";

import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cartaControlTooltips } from "@/tools/carta-control/carta-control-tooltips";
import { useCartaControlStore } from "@/tools/carta-control/store";
import type { ControlChart } from "@/tools/carta-control/types";

interface ChartParamsProps {
  chart: ControlChart;
}

function FieldLabel({ tooltipKey, text }: { tooltipKey: string; text: string }) {
  const tip = cartaControlTooltips[tooltipKey];
  return (
    <div className="flex items-center gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {text}
      </label>
      {tip ? (
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex cursor-default">
              <Info className="size-3 text-muted-foreground/60" />
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tip.tip}</p>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  );
}

function numberOr(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") {
    return null;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ChartParams({ chart }: ChartParamsProps) {
  const setUpperLimit = useCartaControlStore((state) => state.setUpperLimit);
  const setLowerLimit = useCartaControlStore((state) => state.setLowerLimit);
  const setCenterLineMode = useCartaControlStore((state) => state.setCenterLineMode);
  const setCenterLineValue = useCartaControlStore((state) => state.setCenterLineValue);
  const setAxes = useCartaControlStore((state) => state.setAxes);

  return (
    <div className="shrink-0 rounded-lg border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold">Parametros de la carta</h3>

      <div className="space-y-4">
        <section className="space-y-2">
          <FieldLabel tooltipKey="limits_upper" text="Limite superior (LCS)" />
          <div className="flex items-center gap-3">
            <Switch
              checked={chart.limits.upper.enabled}
              onCheckedChange={(checked) => setUpperLimit({ enabled: checked })}
              aria-label="Activar limite superior"
            />
            <Input
              type="number"
              step="any"
              value={chart.limits.upper.value}
              disabled={!chart.limits.upper.enabled}
              onChange={(event) => {
                const parsed = numberOr(event.target.value);
                if (parsed !== null) {
                  setUpperLimit({ value: parsed });
                }
              }}
              className="text-sm"
            />
          </div>
        </section>

        <section className="space-y-2">
          <FieldLabel tooltipKey="limits_lower" text="Limite inferior (LCI)" />
          <div className="flex items-center gap-3">
            <Switch
              checked={chart.limits.lower.enabled}
              onCheckedChange={(checked) => setLowerLimit({ enabled: checked })}
              aria-label="Activar limite inferior"
            />
            <Input
              type="number"
              step="any"
              value={chart.limits.lower.value}
              disabled={!chart.limits.lower.enabled}
              onChange={(event) => {
                const parsed = numberOr(event.target.value);
                if (parsed !== null) {
                  setLowerLimit({ value: parsed });
                }
              }}
              className="text-sm"
            />
          </div>
        </section>

        <section className="space-y-2">
          <FieldLabel tooltipKey="center_line_mode" text="Linea central" />
          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <Button
              type="button"
              variant={chart.centerLine.mode === "auto" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setCenterLineMode("auto")}
            >
              Automatica
            </Button>
            <Button
              type="button"
              variant={chart.centerLine.mode === "manual" ? "default" : "ghost"}
              size="sm"
              className="flex-1"
              onClick={() => setCenterLineMode("manual")}
            >
              Manual
            </Button>
          </div>
          {chart.centerLine.mode === "manual" ? (
            <Input
              type="number"
              step="any"
              value={chart.centerLine.value}
              onChange={(event) => {
                const parsed = numberOr(event.target.value);
                if (parsed !== null) {
                  setCenterLineValue(parsed);
                }
              }}
              className="text-sm"
            />
          ) : null}
        </section>

        <section className="space-y-2">
          <FieldLabel tooltipKey="x_tick" text="Paso de etiquetas (eje X)" />
          <Input
            type="number"
            min={1}
            step={1}
            value={chart.axes.xTickStep}
            onChange={(event) => {
              const parsed = numberOr(event.target.value);
              if (parsed !== null && parsed >= 1) {
                setAxes({ xTickStep: Math.round(parsed) });
              }
            }}
            className="text-sm"
          />
        </section>

        <section className="space-y-2">
          <FieldLabel tooltipKey="y_tick" text="Divisiones (eje Y)" />
          <Input
            type="number"
            min={2}
            step={1}
            value={chart.axes.yTickCount}
            onChange={(event) => {
              const parsed = numberOr(event.target.value);
              if (parsed !== null && parsed >= 2) {
                setAxes({ yTickCount: Math.round(parsed) });
              }
            }}
            className="text-sm"
          />
        </section>

        <section className="space-y-2">
          <FieldLabel tooltipKey="y_range" text="Rango del eje Y" />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="any"
              placeholder="Min (auto)"
              value={chart.axes.yMin ?? ""}
              onChange={(event) => setAxes({ yMin: numberOr(event.target.value) })}
              className="text-sm"
            />
            <Input
              type="number"
              step="any"
              placeholder="Max (auto)"
              value={chart.axes.yMax ?? ""}
              onChange={(event) => setAxes({ yMax: numberOr(event.target.value) })}
              className="text-sm"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
