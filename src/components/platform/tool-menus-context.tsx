"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  ExportColors,
  ExportFieldOption,
  ExportFormat,
  ExportLayoutOption,
  ExportOptions,
  ExportSizeUnit,
  ExportWatermark,
} from "@/lib/export/types";
import { lightExportColors } from "@/lib/export/types";

export interface ExportDescriptor {
  docId: string;
  toolId: string;
  title: string;
  layouts: ExportLayoutOption[];
  fields: ExportFieldOption[];
  formats: ExportFormat[];
  renderPreview: (options: ExportOptions) => ReactNode;
  export: (format: ExportFormat, options: ExportOptions) => Promise<void>;
}

export interface FileDescriptor {
  docId: string;
  toolId: string;
  title: string;
  fileExtension: string;
  save: () => void;
  open: (file: File) => void;
}

function defaultExportOptions(layouts: ExportLayoutOption[], fields: ExportFieldOption[]): ExportOptions {
  return {
    layout: layouts[0]?.id ?? "",
    format: "svg" as ExportFormat,
    size: { value: 1600, unit: "px" as ExportSizeUnit },
    colors: lightExportColors,
    watermark: { enabled: false, text: "" },
    fields: fields.map((f) => f.id),
  };
}

interface ToolMenusContextValue {
  exportDescriptor: ExportDescriptor | null;
  fileDescriptor: FileDescriptor | null;
  exportOptions: ExportOptions;
  setExportOptions: (partial: Partial<ExportOptions>) => void;
  setExportColor: (key: keyof ExportColors, value: string) => void;
  setExportWatermark: (partial: Partial<ExportWatermark>) => void;
  registerToolMenus: (exportD: ExportDescriptor | null, fileD: FileDescriptor | null) => void;
}

const ToolMenusContext = createContext<ToolMenusContextValue | null>(null);

export function useToolMenus(): ToolMenusContextValue {
  const ctx = useContext(ToolMenusContext);
  if (!ctx) {
    return {
      exportDescriptor: null,
      fileDescriptor: null,
      exportOptions: defaultExportOptions([], []),
      setExportOptions: () => {},
      setExportColor: () => {},
      setExportWatermark: () => {},
      registerToolMenus: () => {},
    };
  }
  return ctx;
}

export function ToolMenusProvider({ children }: { children: ReactNode }) {
  const [exportDescriptor, setExportDescriptor] = useState<ExportDescriptor | null>(null);
  const [fileDescriptor, setFileDescriptor] = useState<FileDescriptor | null>(null);

  const [exportOptions, setExportOptionsState] = useState<ExportOptions>(
    defaultExportOptions([], []),
  );
  const [previousDocId, setPreviousDocId] = useState<string | null>(null);

  const registerToolMenus = useCallback(
    (exportD: ExportDescriptor | null, fileD: FileDescriptor | null) => {
      const newDocId = exportD?.docId ?? fileD?.docId ?? null;

      setExportDescriptor(exportD);
      setFileDescriptor(fileD);

      if (newDocId && newDocId !== previousDocId) {
        const layouts = exportD?.layouts ?? [];
        const fields = exportD?.fields ?? [];
        setExportOptionsState(defaultExportOptions(layouts, fields));
        setPreviousDocId(newDocId);
      }
    },
    [previousDocId],
  );

  const setExportOptions = useCallback((partial: Partial<ExportOptions>) => {
    setExportOptionsState((prev) => ({ ...prev, ...partial }));
  }, []);

  const setExportColor = useCallback(
    (key: keyof ExportColors, value: string) => {
      setExportOptionsState((prev) => ({
        ...prev,
        colors: { ...prev.colors, [key]: value },
      }));
    },
    [],
  );

  const setExportWatermark = useCallback(
    (partial: Partial<ExportWatermark>) => {
      setExportOptionsState((prev) => ({
        ...prev,
        watermark: { ...prev.watermark, ...partial },
      }));
    },
    [],
  );

  const value = useMemo<ToolMenusContextValue>(
    () => ({
      exportDescriptor,
      fileDescriptor,
      exportOptions,
      setExportOptions,
      setExportColor,
      setExportWatermark,
      registerToolMenus,
    }),
    [exportDescriptor, fileDescriptor, exportOptions, setExportOptions, setExportColor, setExportWatermark, registerToolMenus],
  );

  return (
    <ToolMenusContext.Provider value={value}>
      {children}
    </ToolMenusContext.Provider>
  );
}
