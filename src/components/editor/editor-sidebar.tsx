"use client";

import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Settings2, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useSipocStore } from "@/store/sipoc-store";
import type { SIPOCDiagram } from "@/types/sipoc";

interface DesktopSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
}

interface MobileSidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onOpenSettings: () => void;
}

interface SidebarTreeProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

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
  if (left.length !== right.length) {
    return false;
  }

  return left.every((entry, index) => entry === right[index]);
}

function SidebarTree({ collapsed, onNavigate }: SidebarTreeProps) {
  const root = useSipocStore((state) => state.root);
  const activePath = useSipocStore((state) => state.path);
  const navigateToPath = useSipocStore((state) => state.navigateToPath);
  const tree = buildSipocTree(root);

  if (collapsed) {
    return (
      <div className="flex justify-center">
        <div
          className="rounded-md border bg-muted/20 p-2 text-muted-foreground"
          aria-label="Arbol SIPOC"
          title="Arbol SIPOC"
        >
          <Workflow className="size-4" />
        </div>
      </div>
    );
  }

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
          onClick={() => {
            navigateToPath(node.path);
            onNavigate?.();
          }}
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
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arbol SIPOC</p>
        <p className="text-[11px] text-muted-foreground/80">Navega por niveles anidados del diagrama.</p>
      </div>
      {renderNode(tree, 0)}
    </div>
  );
}

export function DesktopSidebar({ collapsed, onToggle, onOpenSettings }: DesktopSidebarProps) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 rounded-xl border bg-card p-3 shadow-sm transition-all duration-300 md:flex md:flex-col",
        collapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <div className={cn("mb-3 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {collapsed ? null : <span className="text-sm font-semibold">Simple SIPOC</span>}
        <Button size="icon-sm" variant="ghost" onClick={onToggle} aria-label="Colapsar menu lateral">
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <SidebarTree collapsed={collapsed} />
      </div>

      <div className="mt-3 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className={cn("w-full", collapsed ? "justify-center px-0" : "justify-start")}
          onClick={onOpenSettings}
          aria-label="Abrir configuraciones"
          title={collapsed ? "Configuraciones" : undefined}
        >
          <Settings2 className={cn("size-4", collapsed ? "mr-0" : "mr-2")} />
          {collapsed ? null : <span>Configuraciones</span>}
        </Button>
      </div>
    </aside>
  );
}

export function MobileSidebar({ mobileOpen, onMobileOpenChange, onOpenSettings }: MobileSidebarProps) {
  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        className="md:hidden"
        aria-label="Abrir menu lateral"
        onClick={() => onMobileOpenChange(true)}
      >
        <Menu className="size-4" />
      </Button>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle>Simple SIPOC</SheetTitle>
            <SheetDescription>Navegacion del arbol SIPOC y accesos del editor.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col gap-3 p-4">
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <SidebarTree collapsed={false} onNavigate={() => onMobileOpenChange(false)} />
            </div>

            <div className="border-t pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  onOpenSettings();
                  onMobileOpenChange(false);
                }}
              >
                <Settings2 className="mr-2 size-4" />
                Configuraciones
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
