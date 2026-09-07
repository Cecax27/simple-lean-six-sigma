"use client";

import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSipocStore } from "@/tools/sipoc/store";
import type { SIPOCDiagram } from "@/tools/sipoc/types";

interface SipocTreeNode {
  id: string;
  title: string;
  path: string[];
  processLabel?: string;
  children: SipocTreeNode[];
}

function buildSipocTree(diagram: SIPOCDiagram, path: string[] = [], processLabel?: string): SipocTreeNode {
  return {
    id: diagram.id,
    title: diagram.title,
    path,
    processLabel,
    children: diagram.processes
      .filter((process) => Boolean(process.child))
      .map((process) => buildSipocTree(process.child as SIPOCDiagram, [...path, process.id], process.label)),
  };
}

function pathsAreEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((entry, index) => entry === right[index]);
}

export function SipocTreePanel() {
  const root = useSipocStore((state) => state.root);
  const activePath = useSipocStore((state) => state.path);
  const navigateToPath = useSipocStore((state) => state.navigateToPath);
  const tree = buildSipocTree(root);

  function renderNode(node: SipocTreeNode, depth: number): React.ReactNode {
    const isActive = pathsAreEqual(node.path, activePath);

    return (
      <div key={`${node.id}-${node.path.join("/")}`} className="space-y-1">
        <Button
          variant={isActive ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "h-auto w-full justify-start gap-2 rounded-md py-2 text-left",
            !isActive && "text-muted-foreground hover:text-foreground",
          )}
          style={{ paddingLeft: `${0.5 + depth * 0.8}rem` }}
          onClick={() => navigateToPath(node.path)}
        >
          <ChevronRight className={cn("size-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
          <span className="block">
            <span className="line-clamp-1">{node.title}</span>
            {node.processLabel ? <span className="block text-xs text-muted-foreground">Proceso: {node.processLabel}</span> : null}
          </span>
        </Button>

        {node.children.length > 0 ? (
          <div className="ml-2 space-y-1 border-l border-border/70 pl-1">{node.children.map((child) => renderNode(child, depth + 1))}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="px-1">
        <p className="text-xs font-medium text-muted-foreground">Arbol SIPOC</p>
        <p className="text-[11px] text-muted-foreground/80">Navega por niveles anidados del diagrama.</p>
      </div>
      {renderNode(tree, 0)}
    </div>
  );
}
