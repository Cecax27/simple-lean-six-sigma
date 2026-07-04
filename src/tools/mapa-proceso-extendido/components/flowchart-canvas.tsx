"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  applyNodeChanges,
  Background,
  Controls,
  ReactFlow,
  useViewport,
  type Edge,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes, type ProcessMapNodeData } from "@/tools/mapa-proceso-extendido/components/flowchart-nodes";
import {
  COLUMN_WIDTH,
  computeGridDimensions,
  LANE_HEADER_HEIGHT,
  LANE_HEADER_WIDTH,
  ROW_HEIGHT,
} from "@/tools/mapa-proceso-extendido/layout";
import { useProcessMapStore } from "@/tools/mapa-proceso-extendido/store";
import type { Activity, FlowchartData } from "@/tools/mapa-proceso-extendido/types";

interface FlowchartCanvasProps {
  flowchart: FlowchartData;
  departments: { id: string; name: string }[];
  stages: { id: string; name: string }[];
  activities: Activity[];
  version: number;
}

export function FlowchartCanvas({
  flowchart,
  departments,
  stages,
  activities,
  version,
}: FlowchartCanvasProps) {
  const updateFlowchartNode = useProcessMapStore((s) => s.updateFlowchartNode);

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

  const computedNodes = useMemo<Node<ProcessMapNodeData>[]>(
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

  const computedEdges = useMemo<Edge[]>(
    () =>
      flowchart.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: false,
        style: { strokeWidth: 1.5 },
        markerEnd: { type: "arrowclosed" as const },
      })),
    [flowchart.edges],
  );

  const [rfNodes, setRfNodes] = useState<Node[]>(computedNodes);
  const [rfEdges, setRfEdges] = useState<Edge[]>(computedEdges);
  const prevVersion = useRef(version);

  useEffect(() => {
    if (version !== prevVersion.current) {
      prevVersion.current = version;
      setRfNodes(computedNodes);
      setRfEdges(computedEdges);
    }
  }, [version, computedNodes, computedEdges]);

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setRfNodes((nds) => applyNodeChanges(changes, nds) as Node[]);
  }, []);

  const onNodeDragStop = useCallback(
    (_event: MouseEvent | TouchEvent, node: Node) => {
      updateFlowchartNode(node.id, node.position);
    },
    [updateFlowchartNode],
  );

  return (
    <div className="h-[600px] w-full rounded-lg border overflow-hidden [--xy-controls-button-background-color:hsl(var(--card))] [--xy-controls-button-background-color-hover:hsl(var(--accent))] [--xy-controls-button-color:hsl(var(--foreground))] [--xy-controls-button-border-color:hsl(var(--border))]">
      <ReactFlow
        key={version}
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDragStop={onNodeDragStop}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <SwimlaneBackground
          flowchart={flowchart}
          departmentNames={departmentNames}
          stageNames={stageNames}
        />
        <Background gap={20} size={1} color="hsl(var(--border))" />
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

  const { gridWidth, gridHeight, rowYOffset, columnXOffset } = computeGridDimensions(
    flowchart.departmentOrder,
    flowchart.rowHeights,
    flowchart.stageOrder,
    flowchart.columnWidths,
  );

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{
        transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        transformOrigin: "0 0",
      }}
    >
      {stgs.map((stage, i) => {
        const ry = rowYOffset.get(stage.id) ?? LANE_HEADER_HEIGHT + i * ROW_HEIGHT;
        const rh = flowchart.rowHeights?.[stage.id] ?? ROW_HEIGHT;
        return (
          <rect
            key={stage.id}
            x={0}
            y={ry}
            width={gridWidth}
            height={rh}
            fill={i % 2 === 0 ? "hsl(var(--muted) / 0.15)" : "hsl(var(--muted) / 0.05)"}
            stroke="hsl(var(--border))"
            strokeWidth={0.5}
            rx={2}
          />
        );
      })}

      {depts.map((dept) => {
        const cx = columnXOffset.get(dept.id) ?? LANE_HEADER_WIDTH;
        const cw = flowchart.columnWidths?.[dept.id] ?? COLUMN_WIDTH;
        return (
          <line
            key={dept.id}
            x1={cx}
            y1={0}
            x2={cx}
            y2={gridHeight}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        );
      })}

      {depts.map((dept) => {
        const cx = columnXOffset.get(dept.id) ?? LANE_HEADER_WIDTH;
        const cw = flowchart.columnWidths?.[dept.id] ?? COLUMN_WIDTH;
        return (
          <g key={`dep-hdr-${dept.id}`}>
            <rect
              x={cx}
              y={0}
              width={cw}
              height={LANE_HEADER_HEIGHT}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              x={cx + cw / 2}
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
        );
      })}

      {stgs.map((stage) => {
        const ry = rowYOffset.get(stage.id) ?? 0;
        const rh = flowchart.rowHeights?.[stage.id] ?? ROW_HEIGHT;
        return (
          <g key={`stag-hdr-${stage.id}`}>
            <rect
              x={0}
              y={ry}
              width={LANE_HEADER_WIDTH}
              height={rh}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              x={LANE_HEADER_WIDTH / 2}
              y={ry + rh / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
              fontSize={11}
              fontWeight={600}
            >
              {stage.name}
            </text>
          </g>
        );
      })}

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
