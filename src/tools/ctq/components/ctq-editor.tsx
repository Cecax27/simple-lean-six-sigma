"use client";

import { AlertCircle, BookOpen, CheckCircle2, Info, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ctqTooltips } from "@/tools/ctq/ctq-tooltips";
import { exportAsPdf, exportAsPng, exportAsSvg } from "@/lib/export/client-export";
import type { ExportFormat, ExportOptions } from "@/lib/export/types";
import { serializeToXml, parseFromXml } from "@/tools/ctq/xml";
import { ctqExportLayouts, ctqExportFields } from "@/tools/ctq/types";
import { useCtqStore } from "@/tools/ctq/store";
import { useDocsStore } from "@/store/docs-store";
import { HelpDialog } from "@/tools/ctq/components/help-dialog";
import { InlineEditColumn } from "@/tools/ctq/components/inline-edit-column";
import { ExportTree } from "@/tools/ctq/components/export-tree";
import {
  useToolMenus,
  type ExportDescriptor,
  type FileDescriptor,
} from "@/components/platform/tool-menus-context";

type FeedbackTone = "info" | "success" | "error";

interface FeedbackMessage {
  tone: FeedbackTone;
  message: string;
}

interface CtqEditorProps {
  docId: string;
}

export function CtqEditor({ docId }: CtqEditorProps) {
  const exportAreaRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const loadedRef = useRef(false);

  const root = useCtqStore((state) => state.root);
  const selectedNeedId = useCtqStore((state) => state.selectedNeedId);
  const selectedDriverId = useCtqStore((state) => state.selectedDriverId);
  const setTitle = useCtqStore((state) => state.setTitle);
  const selectNeed = useCtqStore((state) => state.selectNeed);
  const selectDriver = useCtqStore((state) => state.selectDriver);
  const addNeed = useCtqStore((state) => state.addNeed);
  const removeNeed = useCtqStore((state) => state.removeNeed);
  const updateNeedLabel = useCtqStore((state) => state.updateNeedLabel);
  const addDriver = useCtqStore((state) => state.addDriver);
  const removeDriver = useCtqStore((state) => state.removeDriver);
  const updateDriverLabel = useCtqStore((state) => state.updateDriverLabel);
  const addRequirement = useCtqStore((state) => state.addRequirement);
  const removeRequirement = useCtqStore((state) => state.removeRequirement);
  const updateRequirementLabel = useCtqStore((state) => state.updateRequirementLabel);
  const replaceRoot = useCtqStore((state) => state.replaceRoot);
  const resetTree = useCtqStore((state) => state.reset);
  const getSelectedNeed = useCtqStore((state) => state.getSelectedNeed);
  const getSelectedDriver = useCtqStore((state) => state.getSelectedDriver);

  const docTitle = useDocsStore((state) => state.getDoc(docId))?.title ?? "Sin titulo";
  const getDocData = useDocsStore((state) => state.getDocData);
  const setDocData = useDocsStore((state) => state.setDocData);
  const renameDoc = useDocsStore((state) => state.renameDoc);

  const selectedNeed = getSelectedNeed();
  const selectedDriver = getSelectedDriver();

  const needsItems = useMemo(
    () => root.needs.map((n) => ({ id: n.id, label: n.label })),
    [root.needs],
  );

  const driversItems = useMemo(
    () => selectedNeed?.drivers.map((d) => ({ id: d.id, label: d.label })) ?? [],
    [selectedNeed],
  );

  const requirementsItems = useMemo(
    () => selectedDriver?.requirements.map((r) => ({ id: r.id, label: r.label })) ?? [],
    [selectedDriver],
  );

  // Load doc data on mount
  useEffect(() => {
    if (loadedRef.current) return;
    const data = getDocData(docId);
    if (data) {
      replaceRoot(data as never);
    }
    loadedRef.current = true;
  }, [docId, getDocData, replaceRoot]);

  // Sync changes back to docs-store
  useEffect(() => {
    if (!loadedRef.current) return;
    setDocData(docId, root);
  }, [root, docId, setDocData]);

  // Sync doc title
  useEffect(() => {
    if (!loadedRef.current) return;
    if (root.title && root.title !== docTitle) {
      renameDoc(docId, root.title);
    }
  }, [root.title, docId, docTitle, renameDoc]);

  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => setFeedback(null), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  function pushFeedback(tone: FeedbackTone, message: string): void {
    setFeedback({ tone, message });
  }

  const downloadXml = useCallback((): void => {
    const xml = serializeToXml(root);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${docTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") || "arbol-ctq"}.xml`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    pushFeedback("success", "Archivo XML descargado.");
  }, [root, docTitle]);

  const handleLoadXml = useCallback(
    async (file: File): Promise<void> => {
      const text = await file.text();
      try {
        const tree = parseFromXml(text);
        replaceRoot(tree);
        pushFeedback("success", "XML cargado correctamente.");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudo cargar el XML.";
        pushFeedback("error", message);
      }
    },
    [replaceRoot],
  );

  const { exportOptions, registerToolMenus } = useToolMenus();

  const exportDescriptor = useMemo<ExportDescriptor | null>(() => {
    return {
      docId,
      toolId: "ctq",
      title: docTitle,
      layouts: ctqExportLayouts,
      fields: ctqExportFields,
      formats: ["svg", "png", "pdf"],
      renderPreview: (opts: ExportOptions) => (
        <ExportTree tree={root} options={opts} />
      ),
      export: async (format: ExportFormat, _opts: ExportOptions) => {
        try {
          if (!exportAreaRef.current) {
            pushFeedback("error", "No se encontro el area para exportar.");
            return;
          }
          if (format === "png") {
            await exportAsPng(exportAreaRef.current, root.title);
          } else if (format === "pdf") {
            await exportAsPdf(exportAreaRef.current, root.title);
          } else {
            await exportAsSvg(exportAreaRef.current, root.title);
          }
          pushFeedback("success", `Exportacion ${format.toUpperCase()} completada.`);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "No se pudo exportar el diagrama.";
          pushFeedback("error", message);
        }
      },
    };
  }, [docId, docTitle, root]);

  const fileDescriptor = useMemo<FileDescriptor | null>(
    () => ({
      docId,
      toolId: "ctq",
      title: docTitle,
      fileExtension: "xml",
      save: downloadXml,
      open: handleLoadXml,
    }),
    [docId, docTitle, downloadXml, handleLoadXml],
  );

  useEffect(() => {
    registerToolMenus(exportDescriptor, fileDescriptor);
    return () => registerToolMenus(null, null);
  }, [exportDescriptor, fileDescriptor, registerToolMenus]);

  const feedbackMeta =
    feedback?.tone === "error"
      ? { title: "Operacion fallida", icon: AlertCircle, variant: "destructive" as const }
      : feedback?.tone === "success"
        ? { title: "Operacion completada", icon: CheckCircle2, variant: "default" as const }
        : { title: "Informacion", icon: Info, variant: "default" as const };

  const feedbackFloatingClass =
    feedback?.tone === "error"
      ? "border-rose-500/80 bg-rose-50/95 text-rose-900 ring-1 ring-rose-400/45 dark:border-rose-500/70 dark:bg-rose-950/70 dark:text-rose-100 dark:ring-rose-500/45"
      : feedback?.tone === "success"
        ? "border-emerald-500/80 bg-emerald-50/95 text-emerald-900 ring-1 ring-emerald-400/45 dark:border-emerald-500/70 dark:bg-emerald-950/70 dark:text-emerald-100 dark:ring-emerald-500/45"
        : "border-sky-500/80 bg-sky-50/95 text-sky-900 ring-1 ring-sky-400/45 dark:border-sky-500/70 dark:bg-sky-950/70 dark:text-sky-100 dark:ring-sky-500/45";

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 overflow-hidden">
      {/* Feedback toast */}
      {feedback && feedbackMeta ? (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-50 px-3 md:top-4 md:px-6">
          <Alert
            className={`pointer-events-auto mx-auto w-full max-w-2xl border-2 shadow-xl backdrop-blur ${feedbackFloatingClass}`}
            variant={feedbackMeta.variant}
          >
            <feedbackMeta.icon />
            <AlertTitle>{feedbackMeta.title}</AlertTitle>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      {/* Header */}
      <header className="shrink-0 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <label className="block text-xs font-medium text-muted-foreground">
                  {ctqTooltips.title.label}
                </label>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-flex cursor-default">
                      <Info className="size-3 text-muted-foreground/60" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{ctqTooltips.title.tip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                value={root.title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-96 max-w-full"
              />
            </div>
          </div>
          <HelpDialog />
        </div>
      </header>

      {/* 3-column grid */}
      <main className="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-hidden">
        <InlineEditColumn
          title="Necesidades"
          placeholder="Agregar necesidad"
          items={needsItems}
          selectedId={selectedNeedId}
          onSelect={selectNeed}
          onAdd={addNeed}
          onRemove={removeNeed}
          onUpdateLabel={updateNeedLabel}
        />
        <InlineEditColumn
          title="Impulsores"
          placeholder="Agregar impulsor"
          items={driversItems}
          selectedId={selectedDriverId}
          onSelect={selectDriver}
          onAdd={addDriver}
          onRemove={removeDriver}
          onUpdateLabel={updateDriverLabel}
          disabled={!selectedNeedId}
          disabledMessage="Selecciona una necesidad para ver sus impulsores"
        />
        <InlineEditColumn
          title="Requisitos"
          placeholder="Agregar requisito"
          items={requirementsItems}
          selectedId={null}
          onSelect={() => {}}
          onAdd={addRequirement}
          onRemove={removeRequirement}
          onUpdateLabel={updateRequirementLabel}
          disabled={!selectedDriverId}
          disabledMessage="Selecciona un impulsor para ver sus requisitos"
        />
      </main>

      {/* Toolbar */}
      <footer className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border bg-card/60 p-3">
        <Button
          variant="outline"
          size="sm"
          className="justify-start border-rose-300 text-rose-700 hover:bg-rose-50"
          onClick={resetTree}
        >
          <RotateCcw className="mr-2 size-4" /> Reiniciar
        </Button>
      </footer>

      {/* Hidden export area */}
      <section className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
        <div ref={exportAreaRef}>
          <ExportTree tree={root} options={exportOptions} />
        </div>
      </section>
    </div>
  );
}
