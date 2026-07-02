"use client";

import { useMemo } from "react";
import {
  Background,
  Controls,
  ReactFlow,
  useViewport,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes, type ProcessMapNodeData } from "@/tools/mapa-proceso-extendido/components/flowchart-nodes";
import {
  COLUMN_WIDTH,
  LANE_HEADER_HEIGHT,
  LANE_HEADER_WIDTH,
  ROW_HEIGHT,
} from "@/tools/mapa-proceso-extendido/layout";
import type { Activity, FlowchartData } from "@/tools/mapa-proceso-extendido/types";

interface FlowchartCanvasProps {
  flowchart: FlowchartData;
  departments: { id: string; name: string }[];
  stages: { id: string; name: string }[];
  activities: Activity[];
}

export function FlowchartCanvas({
  flowchart,
  departments,
  stages,
  activities,
}: FlowchartCanvasProps) {
  const departmentNames = useMemo(
    () => new Map(departments.map((d) => [d.id, d.name])),
    [departments],
  );
  const stageNames = useMemo(
    () => new Map(stages.map((s) => [s.id, s.name])),
    [stages],
  );
  const activityMap = useMemo(
    () => new Map(activities.map((a) => [a.id, a])),
    [activities],
  );

  const nodes: Node<ProcessMapNodeData>[] = useMemo(
    () =>
      flowchart.nodes.map((fn) => {
        const act = activityMap.get(fn.id);
        return {
          id: fn.id,
          type: (act?.type ?? "process") as string,
          position: fn.position,
          data: {
            label: act?.name ?? `Actividad ${fn.id}`,
            activityType: act?.type ?? "process",
          },
        };
      }),
    [flowchart.nodes, activityMap],
  );

  const edges: Edge[] = useMemo(
    () =>
      flowchart.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: false,
        style: { strokeWidth: 1.5 },
        markerEnd: { type: "arrowclosed" as const, width: 14, height: 14 },
      })),
    [flowchart.edges],
  );

  return (
    <div className="h-[600px] w-full rounded-lg border overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <SwimlaneBackground
          flowchart={flowchart}
          departmentNames={departmentNames}
          stageNames={stageNames}
        />
        <Background gap={20} size={1} color="hsl(var(--border))" />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
}

function SwimlaneBackground({
  flowchart,
  departmentNames,
  stageNames,
}: {
  flowchart: FlowchartData;
  departmentNames: Map<string, string>;
  stageNames: Map<string, string>;
}) {
  const { x, y, zoom } = useViewport();

  const depts = flowchart.departmentOrder.map((id) => ({
    id,
    name: departmentNames.get(id) ?? id,
  }));
  const stgs = flowchart.stageOrder.map((id) => ({
    id,
    name: stageNames.get(id) ?? id,
  }));

  const gridWidth = depts.length * COLUMN_WIDTH + LANE_HEADER_WIDTH;
  const gridHeight = stgs.length * ROW_HEIGHT + LANE_HEADER_HEIGHT;

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        transformOrigin: "0 0",
      }}
    >
      {stgs.map((stage, i) => (
        <rect
          key={stage.id}
          x={0}
          y={LANE_HEADER_HEIGHT + i * ROW_HEIGHT}
          width={gridWidth}
          height={ROW_HEIGHT}
          fill={i % 2 === 0 ? "hsl(var(--muted) / 0.15)" : "hsl(var(--muted) / 0.05)"}
          stroke="hsl(var(--border))"
          strokeWidth={0.5}
          rx={2}
        />
      ))}

      {depts.map((dept, i) => (
        <line
          key={dept.id}
          x1={LANE_HEADER_WIDTH + i * COLUMN_WIDTH}
          y1={0}
          x2={LANE_HEADER_WIDTH + i * COLUMN_WIDTH}
          y2={gridHeight}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
      ))}

      {depts.map((dept, i) => (
        <g key={`dep-hdr-${dept.id}`}>
          <rect
            x={LANE_HEADER_WIDTH + i * COLUMN_WIDTH}
            y={0}
            width={COLUMN_WIDTH}
            height={LANE_HEADER_HEIGHT}
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          <text
            x={LANE_HEADER_WIDTH + i * COLUMN_WIDTH + COLUMN_WIDTH / 2}
            y={LANE_HEADER_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
            fontSize={11}
            fontWeight={600}
          >
            {dept.name}
          </text>
        </g>
      ))}

      {stgs.map((stage, i) => (
        <g key={`stag-hdr-${stage.id}`}>
          <rect
            x={0}
            y={LANE_HEADER_HEIGHT + i * ROW_HEIGHT}
            width={LANE_HEADER_WIDTH}
            height={ROW_HEIGHT}
            fill="hsl(var(--card))"
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
          <text
            x={LANE_HEADER_WIDTH / 2}
            y={LANE_HEADER_HEIGHT + i * ROW_HEIGHT + ROW_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground"
            fontSize={11}
            fontWeight={600}
          >
            {stage.name}
          </text>
        </g>
      ))}

      <rect
        x={0}
        y={0}
        width={LANE_HEADER_WIDTH}
        height={LANE_HEADER_HEIGHT}
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        strokeWidth={1}
      />
    </svg>
  );
}
