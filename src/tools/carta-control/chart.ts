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
  if (!Number.isFinite(value)) {
    return String(value);
  }
  const rounded = Math.round(value * 100) / 100;
  const hasDecimals = Math.abs(rounded - Math.round(rounded)) > 1e-9;
  const options: Intl.NumberFormatOptions = hasDecimals
    ? { minimumFractionDigits: 1, maximumFractionDigits: 2 }
    : { maximumFractionDigits: 0 };
  return rounded.toLocaleString("en-US", options);
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
  const label = point.label.trim();
  const date = parseDateLabel(label);
  if (date) {
    return formatDateLabel(date, hasTimeLabel(label));
  }
  return label || String(index + 1);
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_ISO_PATTERN = /^\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}/;
const DATE_SLASH_PATTERN = /^\d{2}\/\d{2}\/\d{2,4}(?:\s+\d{2}:\d{2})?$/;
const DATE_DOT_PATTERN = /^\d{2}\.\d{2}\.\d{2,4}(?:\s+\d{2}:\d{2})?$/;
const TIME_PATTERN = /\d{2}:\d{2}/;

function parseDayMonthYear(day: number, month: number, year: number): Date | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const twoDigitYear = year < 100 ? 2000 + year : year;
  const date = new Date(twoDigitYear, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== twoDigitYear) {
    return null;
  }
  return date;
}

function applyTime(date: Date, hours: number, minutes: number): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

function parseSlashOrDotDate(trimmed: string, separator: string): Date | null {
  const parts = trimmed.split(separator);
  if (parts.length < 3) {
    return null;
  }
  const day = Number(parts[0]);
  const month = Number(parts[1]);
  const yearToken = parts[2];
  const timeMatch = yearToken.match(/^(\d{2,4})\s+(\d{2}):(\d{2})$/);
  const year = timeMatch ? Number(timeMatch[1]) : Number(yearToken);
  const date = parseDayMonthYear(day, month, year);
  if (!date) {
    return null;
  }
  return timeMatch ? applyTime(date, Number(timeMatch[2]), Number(timeMatch[3])) : date;
}

export function parseDateLabel(label: string): Date | null {
  const trimmed = label.trim();
  if (!trimmed) {
    return null;
  }

  if (DATE_ONLY_PATTERN.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (DATE_TIME_ISO_PATTERN.test(trimmed)) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (DATE_SLASH_PATTERN.test(trimmed)) {
    return parseSlashOrDotDate(trimmed, "/");
  }

  if (DATE_DOT_PATTERN.test(trimmed)) {
    return parseSlashOrDotDate(trimmed, ".");
  }

  return null;
}

export function hasTimeLabel(label: string): boolean {
  return TIME_PATTERN.test(label.trim());
}

export function formatDateLabel(date: Date, withTime: boolean): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const base = `${day}/${month}/${year}`;
  if (withTime) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${base} ${hours}:${minutes}`;
  }
  return base;
}

export function pointsAreDates(points: ControlChartPoint[]): boolean {
  const labeled = points.filter((point) => point.label.trim() !== "");
  if (labeled.length === 0) {
    return false;
  }
  const parsedCount = labeled.filter(
    (point) => parseDateLabel(point.label) !== null,
  ).length;
  return parsedCount >= Math.ceil(labeled.length / 2);
}

export function pointsHaveTime(points: ControlChartPoint[]): boolean {
  return points.some((point) => hasTimeLabel(point.label));
}

export function countOutOfControl(chart: ControlChart): number {
  return chart.points.filter((point) => isPointOutOfControl(point, chart)).length;
}
