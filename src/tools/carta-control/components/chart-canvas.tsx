"use client";

import {
  ControlChartSvg,
  interactiveChartColors,
  type ChartColors,
} from "@/tools/carta-control/components/control-chart-svg";
import { formatValue, getPointXLabel } from "@/tools/carta-control/chart";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ControlChart, ControlChartPoint } from "@/tools/carta-control/types";

interface ChartCanvasProps {
  chart: ControlChart;
  width?: number;
  height?: number;
  colors?: ChartColors;
  onPointClick?: (point: ControlChartPoint) => void;
}

export function ChartCanvas({
  chart,
  width = 900,
  height = 480,
  colors = interactiveChartColors,
  onPointClick,
}: ChartCanvasProps) {
  return (
    <ControlChartSvg
      chart={chart}
      width={width}
      height={height}
      colors={colors}
      renderPointExtras={(point, x, y, index) => {
        const label = getPointXLabel(point, index);
        const valueText = `${formatValue(point.value)}${chart.unit ? ` ${chart.unit}` : ""}`;

        return (
          <Tooltip key={point.id}>
            <TooltipTrigger
              render={
                <circle
                  cx={x}
                  cy={y}
                  r={12}
                  fill="transparent"
                  tabIndex={0}
                  className="cursor-pointer focus:outline-none"
                  onClick={onPointClick ? () => onPointClick(point) : undefined}
                />
              }
            />
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-0.5">
                <p className="font-semibold">{label}</p>
                <p>Valor: {valueText}</p>
                {point.comment ? (
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {point.comment}
                  </p>
                ) : null}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }}
    />
  );
}
