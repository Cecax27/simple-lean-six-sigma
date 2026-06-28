import type { CTQTree, CTQNeed, CTQDriver, CTQRequirement } from "@/tools/ctq/types";

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createTree(title: string): CTQTree {
  return {
    id: uid("ctq"),
    title,
    needs: [],
  };
}

export function createNeed(label: string): CTQNeed {
  return {
    id: uid("need"),
    label,
    drivers: [],
  };
}

export function createDriver(label: string): CTQDriver {
  return {
    id: uid("drv"),
    label,
    requirements: [],
  };
}

export function createRequirement(label: string): CTQRequirement {
  return {
    id: uid("req"),
    label,
  };
}
