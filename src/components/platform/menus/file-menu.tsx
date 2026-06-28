"use client";

import { Download, FileUp, FolderOpen } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { FileDescriptor } from "@/components/platform/tool-menus-context";

interface FileMenuProps {
  descriptor: FileDescriptor | null;
  collapsed?: boolean;
}

export function FileMenu({ descriptor, collapsed }: FileMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!descriptor) return null;

  function handleSave() {
    descriptor?.save();
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    descriptor?.open(file);
    event.currentTarget.value = "";
  }

  if (collapsed) {
    return (
      <>
        <DropdownMenuItem onClick={handleSave}>
          <Download className="mr-2 size-4" />
          Guardar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
          <FileUp className="mr-2 size-4" />
          Abrir
        </DropdownMenuItem>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xml,application/xml,text/xml"
          onChange={handleFileSelect}
        />
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full justify-start text-xs")}
          >
            <FolderOpen className="mr-2 size-3.5" />
            Archivo
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="right" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px]">Archivo</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSave}>
          <Download className="mr-2 size-4" />
          Guardar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
          <FileUp className="mr-2 size-4" />
          Abrir
        </DropdownMenuItem>
      </DropdownMenuContent>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".xml,application/xml,text/xml"
        onChange={handleFileSelect}
      />
    </DropdownMenu>
  );
}
