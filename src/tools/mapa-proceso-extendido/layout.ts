import { uid } from "@/tools/mapa-proceso-extendido/tree";
import type {
  ActivityType,
  FlowchartData,
  FlowchartEdge,
  FlowchartNode,
  ProcessMap,
} from "@/tools/mapa-proceso-extendido/types";

const NODE_SIZES: Record<
  ActivityType,
  { width: number; height: number }
> = {
  start: { width: 160, height: 52 },
  process: { width: 180, height: 56 },
  decision: { width: 130, height: 100 },
  end: { width: 160, height: 52 },
};

const COLUMN_WIDTH = 280;
const ROW_HEIGHT = 180;
const LANE_HEADER_WIDTH = 130;
const LANE_HEADER_HEIGHT = 50;
const CELL_PADDING = 16;

export function generateLayout(map: ProcessMap): FlowchartData {
  const departmentOrder = map.departments.map((d) => d.id);
  const stageOrder = map.stages.map((s) => s.id);

  const columnIndex = new Map(departmentOrder.map((id, i) => [id, i]));
  const rowIndex = new Map(stageOrder.map((id, i) => [id, i]));

  const cellOccupancy = new Map<string, number>();
  for (const act of map.activities) {
    const key = `${act.departmentId}-${act.stageId}`;
    cellOccupancy.set(key, (cellOccupancy.get(key) ?? 0) + 1);
  }

  const cellCounter = new Map<string, number>();
  const nodes: FlowchartNode[] = [];

  for (const act of map.activities) {
    const col = columnIndex.get(act.departmentId) ?? 0;
    const row = rowIndex.get(act.stageId) ?? 0;
    const key = `${act.departmentId}-${act.stageId}`;
    const cellCount = cellOccupancy.get(key) ?? 1;
    const cellIdx = cellCounter.get(key) ?? 0;
    cellCounter.set(key, cellIdx + 1);

    const cellX = LANE_HEADER_WIDTH + col * COLUMN_WIDTH;
    const cellY = LANE_HEADER_HEIGHT + row * ROW_HEIGHT;
    const size = NODE_SIZES[act.type] ?? NODE_SIZES.process;

    const availableHeight = ROW_HEIGHT - 2 * CELL_PADDING - cellCount * size.height;
    const gap = cellCount > 1 ? availableHeight / (cellCount + 1) : (ROW_HEIGHT - size.height) / 2 - CELL_PADDING;
    const baseY = cellY + CELL_PADDING;

    const x = Math.round(cellX + (COLUMN_WIDTH - size.width) / 2);
    const y = Math.round(baseY + gap + cellIdx * (size.height + gap));

    nodes.push({ id: act.id, position: { x, y } });
  }

  const edgeIds = new Set<string>();
  const edges: FlowchartEdge[] = [];

  for (const act of map.activities) {
    for (const nextId of act.nextIds) {
      const key = `${act.id}->${nextId}`;
      if (!edgeIds.has(key)) {
        edgeIds.add(key);
        const edge: FlowchartEdge = { id: uid("e"), source: act.id, target: nextId };

        if (act.nextLabels?.[nextId]) {
          edge.label = act.nextLabels[nextId];
        } else if (act.type === "decision" && act.nextIds.length === 2) {
          const idx = act.nextIds.indexOf(nextId);
          edge.label = idx === 0 ? "Sí" : "No";
        }

        edges.push(edge);
      }
    }
  }

  return {
    nodes,
    edges,
    departmentOrder,
    stageOrder,
    stale: false,
  };
}

export function getCellOrigins(
  departments: { id: string }[],
  stages: { id: string }[],
) {
  const departmentX = new Map<string, number>();
  departments.forEach((d, i) => {
    departmentX.set(d.id, LANE_HEADER_WIDTH + i * COLUMN_WIDTH);
  });

  const stageY = new Map<string, number>();
  stages.forEach((s, i) => {
    stageY.set(s.id, LANE_HEADER_HEIGHT + i * ROW_HEIGHT);
  });

  return { departmentX, stageY, COLUMN_WIDTH, ROW_HEIGHT, LANE_HEADER_WIDTH, LANE_HEADER_HEIGHT };
}

export { NODE_SIZES, COLUMN_WIDTH, ROW_HEIGHT, LANE_HEADER_WIDTH, LANE_HEADER_HEIGHT };
