"use client";

import { AlertCircle, CheckCircle2, Info, Plus, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ishikawaTooltips } from "@/tools/ishikawa/ishikawa-tooltips";
import { exportAsPdf, exportAsPng, exportAsSvg } from "@/lib/export/client-export";
import type { ExportFormat, ExportOptions } from "@/lib/export/types";
import { serializeToXml, parseFromXml } from "@/tools/ishikawa/xml";
import { ishikawaExportLayouts, ishikawaExportFields } from "@/tools/ishikawa/types";
import { useIshikawaStore } from "@/tools/ishikawa/store";
import { useDocsStore } from "@/store/docs-store";
import { CategoryCard } from "@/tools/ishikawa/components/category-card";
import { EffectField } from "@/tools/ishikawa/components/effect-field";
import { ExportDiagram } from "@/tools/ishikawa/components/export-diagram";
import { HelpDialog } from "@/tools/ishikawa/components/help-dialog";
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

interface IshikawaEditorProps {
  docId: string;
}

export function IshikawaEditor({ docId }: IshikawaEditorProps) {
  const exportAreaRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const loadedRef = useRef(false);

  const root = useIshikawaStore((state) => state.root);
  const setTitle = useIshikawaStore((state) => state.setTitle);
  const setEffect = useIshikawaStore((state) => state.setEffect);
  const addCategory = useIshikawaStore((state) => state.addCategory);
  const removeCategory = useIshikawaStore((state) => state.removeCategory);
  const renameCategory = useIshikawaStore((state) => state.renameCategory);
  const moveCategoryUp = useIshikawaStore((state) => state.moveCategoryUp);
  const moveCategoryDown = useIshikawaStore((state) => state.moveCategoryDown);
  const addCause = useIshikawaStore((state) => state.addCause);
  const removeCause = useIshikawaStore((state) => state.removeCause);
  const renameCause = useIshikawaStore((state) => state.renameCause);
  const setCauseDescription = useIshikawaStore((state) => state.setCauseDescription);
  const replaceRoot = useIshikawaStore((state) => state.replaceRoot);
  const resetDiagram = useIshikawaStore((state) => state.reset);

  const docTitle = useDocsStore((state) => state.getDoc(docId))?.title ?? "Sin titulo";
  const getDocData = useDocsStore((state) => state.getDocData);
  const setDocData = useDocsStore((state) => state.setDocData);
  const renameDoc = useDocsStore((state) => state.renameDoc);

  const [newCategoryValue, setNewCategoryValue] = useState("");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  // Sync doc title
  useEffect(() => {
    if (!loadedRef.current) return;
    if (root.title && root.title !== docTitle) {
      renameDoc(docId, root.title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root.title]);

  useEffect(() => {
    if (!feedback) return;
    const timeoutId = window.setTimeout(() => setFeedback(null), 3600);
    return () => window.clearTimeout(timeoutId);
  }, [feedback]);

  function pushFeedback(tone: FeedbackTone, message: string): void {
    setFeedback({ tone, message });
  }

  function handleAddCategory() {
    const trimmed = newCategoryValue.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setNewCategoryValue("");
  }

  const downloadXml = useCallback((): void => {
    const xml = serializeToXml(root);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${docTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") || "diagrama-ishikawa"}.xml`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    pushFeedback("success", "Archivo XML descargado.");
  }, [root, docTitle]);

  const handleLoadXml = useCallback(async (file: File): Promise<void> => {
    const text = await file.text();
    try {
      const diagram = parseFromXml(text);
      replaceRoot(diagram);
      pushFeedback("success", "XML cargado correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el XML.";
      pushFeedback("error", message);
    }
  }, [replaceRoot]);

  const { exportOptions, registerToolMenus } = useToolMenus();

  const exportDescriptor = useMemo<ExportDescriptor | null>(() => ({
    docId,
    toolId: "ishikawa",
    title: docTitle,
    layouts: ishikawaExportLayouts,
    fields: ishikawaExportFields,
    formats: ["svg", "png", "pdf"],
    renderPreview: (opts: ExportOptions) => (
      <ExportDiagram diagram={root} options={opts} />
    ),
    export: async (format: ExportFormat, opts: ExportOptions) => {
      if (!exportAreaRef.current) {
        pushFeedback("error", "No se encontro el area para exportar.");
        return;
      }
      try {
        if (format === "svg") {
          await exportAsSvg(exportAreaRef.current, root.title);
        } else if (format === "png") {
          await exportAsPng(exportAreaRef.current, root.title);
        } else {
          await exportAsPdf(exportAreaRef.current, root.title);
        }
        pushFeedback("success", `Exportacion ${format.toUpperCase()} completada.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo exportar el diagrama.";
        pushFeedback("error", message);
      }
    },
  }), [docId, docTitle, root]);

  const fileDescriptor = useMemo<FileDescriptor | null>(() => ({
    docId,
    toolId: "ishikawa",
    title: docTitle,
    fileExtension: "xml",
    save: downloadXml,
    open: handleLoadXml,
  }), [docId, docTitle, downloadXml, handleLoadXml]);

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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1">
            <label className="text-xs font-medium text-muted-foreground">
              Nombre del diagrama
            </label>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex cursor-default">
                  <Info className="size-3 text-muted-foreground/60" />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Un nombre descriptivo para identificar este diagrama.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <Input
            value={root.title}
            onChange={(e) => setTitle(e.target.value)}
            className="max-w-xs text-sm"
          />
        </div>

      </header>

      {/* Effect field */}
      <section className="shrink-0 rounded-lg border bg-card p-4">
        <EffectField value={root.effect} onChange={setEffect} />
      </section>

      {/* Categories grid */}
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {root.categories.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              categoryId={cat.id}
              label={cat.label}
              causes={cat.causes}
              index={index}
              totalCategories={root.categories.length}
              onRename={renameCategory}
              onRemove={removeCategory}
              onMoveUp={moveCategoryUp}
              onMoveDown={moveCategoryDown}
              onAddCause={addCause}
              onRemoveCause={removeCause}
              onRenameCause={renameCause}
              onSetCauseDescription={setCauseDescription}
            />
          ))}

          {/* Add category card */}
          <div className="rounded-lg border-2 border-dashed border-muted p-6 flex flex-col items-center justify-center gap-3">
            <p className="text-sm font-medium text-muted-foreground">Agregar categoria</p>
            <div className="flex w-full gap-2">
              <Input
                value={newCategoryValue}
                onChange={(e) => setNewCategoryValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
                placeholder="Nombre de la categoria..."
                className="h-8 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddCategory}
                disabled={!newCategoryValue.trim()}
                className="shrink-0 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Plus className="mr-1 size-3.5" /> Agregar
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Toolbar */}
      <footer className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border bg-card/60 p-3">
        <HelpDialog />
        <Button
          variant="outline"
          size="sm"
          className="justify-start border-rose-300 text-rose-700 hover:bg-rose-50"
          onClick={resetDiagram}
        >
          <RotateCcw className="mr-2 size-4" /> Reiniciar
        </Button>
      </footer>

      {/* Hidden export area */}
      <section className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
        <div ref={exportAreaRef}>
          <ExportDiagram diagram={root} options={exportOptions} />
        </div>
      </section>
    </div>
  );
}
