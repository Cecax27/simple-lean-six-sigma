import type { IshikawaCause, IshikawaCategory, IshikawaDiagram } from "@/tools/ishikawa/types";
import { SIX_M_DEFAULTS } from "@/tools/ishikawa/types";

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createDiagram(title: string): IshikawaDiagram {
  return {
    id: uid("ishikawa"),
    title,
    effect: "",
    categories: SIX_M_DEFAULTS.map((def) => ({
      id: uid("cat"),
      label: def.label,
      causes: [],
    })),
  };
}

export function createCategory(label: string): IshikawaCategory {
  return { id: uid("cat"), label: label.trim(), causes: [] };
}

export function createCause(label: string): IshikawaCause {
  return { id: uid("cause"), label: label.trim() };
}

export function updateCategories(
  diagram: IshikawaDiagram,
  updater: (categories: IshikawaCategory[]) => IshikawaCategory[],
): IshikawaDiagram {
  return { ...diagram, categories: updater(diagram.categories) };
}

export function updateCauses(
  diagram: IshikawaDiagram,
  categoryId: string,
  updater: (causes: IshikawaCause[]) => IshikawaCause[],
): IshikawaDiagram {
  return {
    ...diagram,
    categories: diagram.categories.map((cat) =>
      cat.id === categoryId ? { ...cat, causes: updater(cat.causes) } : cat,
    ),
  };
}

export function moveCategory(
  diagram: IshikawaDiagram,
  categoryId: string,
  direction: -1 | 1,
): IshikawaDiagram {
  const index = diagram.categories.findIndex((c) => c.id === categoryId);
  if (index === -1) return diagram;
  const target = index + direction;
  if (target < 0 || target >= diagram.categories.length) return diagram;
  const copy = [...diagram.categories];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return { ...diagram, categories: copy };
}
