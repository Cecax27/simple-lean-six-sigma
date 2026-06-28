"use client";

import { Menu } from "lucide-react";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToolMenus } from "@/components/platform/tool-menus-context";
import { FileMenu } from "@/components/platform/menus/file-menu";
import { ExportMenu } from "@/components/platform/menus/export-menu";

interface ToolMenusZoneProps {
  collapsed: boolean;
  children?: ReactNode;
}

export function ToolMenusZone({ collapsed }: ToolMenusZoneProps) {
  const { exportDescriptor, fileDescriptor } = useToolMenus();

  const hasAny = !!(exportDescriptor || fileDescriptor);

  if (!hasAny) return null;

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Menu de herramienta"
              title="Menu de herramienta"
            >
              <Menu className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" side="right" className="w-44">
          <DropdownMenuLabel className="text-[11px]">Herramienta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <FileMenu descriptor={fileDescriptor} collapsed />
          <ExportMenu collapsed />
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="mt-3 border-t pt-3 space-y-1">
      <p className="text-[11px] text-muted-foreground px-1">
        Herramienta
      </p>
      <FileMenu descriptor={fileDescriptor} />
      <ExportMenu />
    </div>
  );
}
