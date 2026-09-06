import { uid } from "@/tools/carta-control/chart";
import type { ControlChartPoint } from "@/tools/carta-control/types";

export interface CsvParseResult {
  points: ControlChartPoint[];
  errors: number;
}

const NUMBER_PATTERN = /^-?\d+(?:[.,]\d+)?$/;

function parseValue(token: string): number | null {
  const trimmed = token.trim();
  if (!NUMBER_PATTERN.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed.replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

function parseLine(line: string): ControlChartPoint | null {
  const tokens = line
    .split(/[,;\t]/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  if (tokens.length === 0) {
    return null;
  }

  const valueIndex = tokens.findIndex((token) => parseValue(token) !== null);
  if (valueIndex === -1) {
    return null;
  }

  const value = parseValue(tokens[valueIndex]) as number;
  const label = tokens.slice(0, valueIndex).join(" ");
  const comment = tokens.slice(valueIndex + 1).join(", ");

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
