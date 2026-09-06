import type { ReactNode } from "react";

import {
  computeCenterLine,
  computeYRange,
  formatValue,
  getPointXLabel,
  isPointOutOfControl,
} from "@/tools/carta-control/chart";
import type {
  ControlChart,
  ControlChartPoint,
} from "@/tools/carta-control/types";

export interface PointRange {
  start: number;
  end: number;
}

export interface ChartColors {
  text: string;
  grid: string;
  axis: string;
  line: string;
  centerLine: string;
  limit: string;
  point: string;
  pointOut: string;
  comment: string;
  background: string;
}

export const interactiveChartColors: ChartColors = {
  text: "hsl(var(--foreground))",
  grid: "hsl(var(--border))",
  axis: "hsl(var(--muted-foreground))",
  line: "hsl(var(--primary))",
  centerLine: "hsl(var(--muted-foreground))",
  limit: "hsl(var(--destructive))",
  point: "hsl(var(--primary))",
  pointOut: "hsl(var(--destructive))",
  comment: "hsl(var(--primary))",
  background: "hsl(var(--card))",
};

const MARGIN = { top: 24, right: 72, bottom: 40, left: 64 };
const POINT_RADIUS = 4.5;
const HALO_RADIUS = 8;

function truncate(value: string, max: number): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, Math.max(0, max - 1))}\u2026`;
}

interface ControlChartSvgProps {
  chart: ControlChart;
  width: number;
  height: number;
  colors: ChartColors;
  range?: PointRange;
  fit?: boolean;
  renderPointExtras?: (
    point: ControlChartPoint,
    x: number,
    y: number,
    index: number,
  ) => ReactNode;
}

export function ControlChartSvg({
  chart,
  width,
  height,
  colors,
  range,
  fit = false,
  renderPointExtras,
}: ControlChartSvgProps) {
  const { points } = chart;
  const totalPoints = points.length;
  const rangeStart = range ? Math.max(0, range.start) : 0;
  const rangeEnd = range
    ? Math.min(totalPoints - 1, range.end)
    : totalPoints - 1;

  const centerLine = computeCenterLine(chart);
  const rangeObj = computeYRange(chart);
  const rangeSpan = rangeObj.max - rangeObj.min || 1;

  const plotLeft = MARGIN.left;
  const plotRight = width - MARGIN.right;
  const plotTop = MARGIN.top;
  const plotBottom = height - MARGIN.bottom;
  const plotWidth = plotRight - plotLeft;
  const plotHeight = plotBottom - plotTop;

  const visibleCount = rangeEnd - rangeStart + 1;

  const xFor = (index: number): number => {
    if (visibleCount <= 1) {
      return plotLeft + plotWidth / 2;
    }
    const position = index - rangeStart;
    return plotLeft + plotWidth * ((position + 0.5) / visibleCount);
  };

  const yFor = (value: number): number => {
    return plotTop + plotHeight * (1 - (value - rangeObj.min) / rangeSpan);
  };

  const yTickCount = Math.max(2, chart.axes.yTickCount || 5);
  const xTickStep = Math.max(1, chart.axes.xTickStep || 1);

  const yTicks: number[] = [];
  for (let i = 0; i < yTickCount; i += 1) {
    yTicks.push(rangeObj.min + rangeSpan * (i / (yTickCount - 1)));
  }

  const visiblePoints = points.filter(
    (_, index) => index >= rangeStart && index <= rangeEnd,
  );

  const polylinePoints = visiblePoints
    .map((point, position) => {
      const index = rangeStart + position;
      return `${xFor(index)},${yFor(point.value)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className={fit ? "h-full w-full" : undefined}
      role="img"
      aria-label={chart.title || "Carta de control"}
      style={{
        backgroundColor: colors.background,
        ...(fit ? {} : { width: `${width}px`, height: `${height}px` }),
      }}
    >
      {yTicks.map((tick) => {
        const y = yFor(tick);
        return (
          <g key={`tick-${tick}`}>
            <line
              x1={plotLeft}
              y1={y}
              x2={plotRight}
              y2={y}
              stroke={colors.grid}
              strokeWidth={1}
            />
            <text
              x={plotLeft - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={11}
              fill={colors.axis}
            >
              {formatValue(tick)}
            </text>
          </g>
        );
      })}

      <line
        x1={plotLeft}
        y1={plotBottom}
        x2={plotRight}
        y2={plotBottom}
        stroke={colors.axis}
        strokeWidth={1.5}
      />
      <line
        x1={plotLeft}
        y1={plotTop}
        x2={plotLeft}
        y2={plotBottom}
        stroke={colors.axis}
        strokeWidth={1.5}
      />

      {visiblePoints.map((point, position) => {
        const index = rangeStart + position;
        if (position % xTickStep !== 0) {
          return null;
        }
        return (
          <text
            key={`xlabel-${point.id}`}
            x={xFor(index)}
            y={plotBottom + 20}
            textAnchor="middle"
            fontSize={11}
            fill={colors.axis}
          >
            {truncate(getPointXLabel(point, index), 16)}
          </text>
        );
      })}

      {chart.unit ? (
        <text x={plotLeft} y={plotTop - 8} fontSize={11} fill={colors.axis}>
          Unidad: {chart.unit}
        </text>
      ) : null}

      {centerLine !== 0 || chart.centerLine.mode === "manual" ? (
        <g>
          <line
            x1={plotLeft}
            y1={yFor(centerLine)}
            x2={plotRight}
            y2={yFor(centerLine)}
            stroke={colors.centerLine}
            strokeWidth={1.5}
            strokeDasharray="2 0"
          />
          <text
            x={plotRight + 6}
            y={yFor(centerLine) + 4}
            fontSize={11}
            fill={colors.centerLine}
          >
            LC {formatValue(centerLine)}
          </text>
        </g>
      ) : null}

      {chart.limits.upper.enabled ? (
        <g>
          <line
            x1={plotLeft}
            y1={yFor(chart.limits.upper.value)}
            x2={plotRight}
            y2={yFor(chart.limits.upper.value)}
            stroke={colors.limit}
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          <text
            x={plotRight + 6}
            y={yFor(chart.limits.upper.value) + 4}
            fontSize={11}
            fill={colors.limit}
          >
            LCS {formatValue(chart.limits.upper.value)}
          </text>
        </g>
      ) : null}

      {chart.limits.lower.enabled ? (
        <g>
          <line
            x1={plotLeft}
            y1={yFor(chart.limits.lower.value)}
            x2={plotRight}
            y2={yFor(chart.limits.lower.value)}
            stroke={colors.limit}
            strokeWidth={1.5}
            strokeDasharray="6 4"
          />
          <text
            x={plotRight + 6}
            y={yFor(chart.limits.lower.value) + 4}
            fontSize={11}
            fill={colors.limit}
          >
            LCI {formatValue(chart.limits.lower.value)}
          </text>
        </g>
      ) : null}

      {visibleCount > 1 ? (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={colors.line}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}

      {visiblePoints.map((point, position) => {
        const index = rangeStart + position;
        const x = xFor(index);
        const y = yFor(point.value);
        const out = isPointOutOfControl(point, chart);
        const fill = out ? colors.pointOut : colors.point;

        return (
          <g key={point.id}>
            {point.comment ? (
              <circle
                cx={x}
                cy={y}
                r={HALO_RADIUS}
                fill={colors.comment}
                fillOpacity={0.18}
              />
            ) : null}
            <circle
              cx={x}
              cy={y}
              r={POINT_RADIUS}
              fill={fill}
              stroke={colors.background}
              strokeWidth={1.5}
            />
            {renderPointExtras ? renderPointExtras(point, x, y, index) : null}
          </g>
        );
      })}
    </svg>
  );
}
