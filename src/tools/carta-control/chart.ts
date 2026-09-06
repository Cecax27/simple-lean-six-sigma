import type {
  ControlChart,
  ControlChartPoint,
} from "@/tools/carta-control/types";

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createChart(title: string): ControlChart {
  return {
    id: uid("carta-control"),
    title,
    unit: "",
    points: [],
    limits: {
      upper: { enabled: true, value: 10 },
      lower: { enabled: true, value: 0 },
    },
    centerLine: { mode: "auto", value: 0 },
    axes: { xTickStep: 1, yTickCount: 5, yMin: null, yMax: null },
  };
}

export function createPoint(
  label: string,
  value: number,
  comment?: string,
): ControlChartPoint {
  const point: ControlChartPoint = {
    id: uid("point"),
    label: label.trim(),
    value,
  };
  if (comment && comment.trim()) {
    point.comment = comment.trim();
  }
  return point;
}

export function formatValue(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function computeCenterLine(chart: ControlChart): number {
  if (chart.centerLine.mode === "manual") {
    return chart.centerLine.value;
  }
  if (chart.points.length === 0) {
    return 0;
  }
  const sum = chart.points.reduce((acc, point) => acc + point.value, 0);
  return sum / chart.points.length;
}

export function isPointOutOfControl(
  point: ControlChartPoint,
  chart: ControlChart,
): boolean {
  if (chart.limits.upper.enabled && point.value > chart.limits.upper.value) {
    return true;
  }
  if (chart.limits.lower.enabled && point.value < chart.limits.lower.value) {
    return true;
  }
  return false;
}

export interface YRange {
  min: number;
  max: number;
}

export function computeYRange(chart: ControlChart): YRange {
  const values: number[] = chart.points.map((point) => point.value);
  values.push(computeCenterLine(chart));

  if (chart.limits.upper.enabled) {
    values.push(chart.limits.upper.value);
  }
  if (chart.limits.lower.enabled) {
    values.push(chart.limits.lower.value);
  }

  if (chart.axes.yMin !== null && chart.axes.yMin !== undefined) {
    values.push(chart.axes.yMin);
  }
  if (chart.axes.yMax !== null && chart.axes.yMax !== undefined) {
    values.push(chart.axes.yMax);
  }

  if (values.length === 0) {
    return { min: 0, max: 10 };
  }

  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) {
    const pad = Math.abs(min) > 0 ? Math.abs(min) * 0.1 : 1;
    min -= pad;
    max += pad;
  } else {
    const pad = (max - min) * 0.1;
    min -= pad;
    max += pad;
  }

  if (chart.axes.yMin !== null && chart.axes.yMin !== undefined) {
    min = chart.axes.yMin;
  }
  if (chart.axes.yMax !== null && chart.axes.yMax !== undefined) {
    max = chart.axes.yMax;
  }

  return { min, max };
}

export function getPointXLabel(point: ControlChartPoint, index: number): string {
  return point.label.trim() || String(index + 1);
}

export function countOutOfControl(chart: ControlChart): number {
  return chart.points.filter((point) => isPointOutOfControl(point, chart)).length;
}
