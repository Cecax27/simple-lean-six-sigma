"use client";

import type { NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { ActivityType } from "@/tools/mapa-proceso-extendido/types";

export type ProcessMapNodeData = {
  label: string;
  activityType: ActivityType;
};

export function StartNode({ data, selected }: NodeProps) {
  const d = data as unknown as ProcessMapNodeData;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-full border-2 shadow-sm bg-background text-center px-4 transition-colors",
        "min-w-[130px] min-h-[44px] select-none",
        selected && "ring-2 ring-ring",
      )}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
      <span className="text-xs font-medium leading-tight">{d.label || "(sin nombre)"}</span>
    </div>
  );
}

export function ProcessNode({ data, selected }: NodeProps) {
  const d = data as unknown as ProcessMapNodeData;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border bg-card shadow-sm text-center px-4 py-2 transition-colors",
        "min-w-[150px] min-h-[48px] select-none",
        selected && "ring-2 ring-ring",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <span className="text-xs font-medium leading-tight">{d.label || "(sin nombre)"}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground" />
    </div>
  );
}

export function DecisionNode({ data, selected }: NodeProps) {
  const d = data as unknown as ProcessMapNodeData;
  return (
    <div
      className={cn(
        "flex items-center justify-center select-none",
        selected && "opacity-90",
      )}
      style={{ width: 120, height: 90 }}
    >
      <svg
        width={120}
        height={90}
        viewBox="0 0 120 90"
        className="absolute inset-0"
      >
        <polygon
          points="60,4 116,45 60,86 4,45"
          className={cn(
            "fill-card stroke-2 stroke-border transition-colors",
            selected && "stroke-ring",
          )}
        />
      </svg>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground !top-0"
        style={{ top: 0 }}
      />
      <span className="text-xs font-medium leading-tight text-center z-10 px-3 max-w-[100px]">
        {d.label || "(sin nombre)"}
      </span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground !bottom-0"
        style={{ bottom: 0 }}
      />
    </div>
  );
}

export function EndNode({ data, selected }: NodeProps) {
  const d = data as unknown as ProcessMapNodeData;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-full border-2 shadow-sm bg-background text-center px-4 transition-colors",
        "min-w-[130px] min-h-[44px] select-none",
        "ring-1 ring-border ring-inset",
        selected && "ring-2 ring-ring",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-muted-foreground" />
      <span className="text-xs font-medium leading-tight">{d.label || "(sin nombre)"}</span>
    </div>
  );
}

export const nodeTypes = {
  start: StartNode,
  process: ProcessNode,
  decision: DecisionNode,
  end: EndNode,
};
