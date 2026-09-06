import { uid } from "@/tools/carta-control/chart";
import type { ControlChartPoint } from "@/tools/carta-control/types";

export interface CsvParseResult {
  points: ControlChartPoint[];
  errors: number;
}

function parseValue(token: string): number | null {
  const trimmed = token.trim().replace(/\./g, "").replace(",", ".");
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return null;
  }
  return value;
}

function parseLine(line: string): ControlChartPoint | null {
  const tokens = line
    .split(/[,;\t]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return null;
  }

  let label = "";
  let value: number | null = null;
  let comment: string | undefined;

  if (tokens.length === 1) {
    value = parseValue(tokens[0]);
  } else if (tokens.length === 2) {
    const firstValue = parseValue(tokens[0]);
    const secondValue = parseValue(tokens[1]);
    if (firstValue !== null && secondValue !== null) {
      value = firstValue;
      comment = tokens[1];
    } else {
      label = tokens[0];
      value = secondValue !== null ? secondValue : parseValue(tokens[1]);
    }
  } else {
    label = tokens[0];
    value = parseValue(tokens[1]);
    comment = tokens.slice(2).join(" ");
  }

  if (value === null) {
    return null;
  }

  const point: ControlChartPoint = {
    id: uid("point"),
    label,
    value,
  };
  if (comment && comment.trim()) {
    point.comment = comment.trim();
  }
  return point;
}

export function parseCsvToPoints(text: string): CsvParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let errors = 0;
  const points: ControlChartPoint[] = [];

  for (const line of lines) {
    const point = parseLine(line);
    if (point) {
      points.push(point);
    } else {
      errors += 1;
    }
  }

  return { points, errors };
}
