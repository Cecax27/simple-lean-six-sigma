"use client";

import { AlertCircle, CheckCircle2, Eye, Info, Pencil, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartCanvas } from "@/tools/carta-control/components/chart-canvas";
import { DisplayControls } from "@/tools/carta-control/components/chart-display-controls";
import type { PointRange } from "@/tools/carta-control/components/control-chart-svg";
import { ChartParams } from "@/tools/carta-control/components/chart-params";
import { PointsTable } from "@/tools/carta-control/components/points-table";
import { ImportCsvDialog } from "@/tools/carta-control/components/import-csv-dialog";
import { PointEditDialog } from "@/tools/carta-control/components/point-edit-dialog";
import { HelpDialog } from "@/tools/carta-control/components/help-dialog";
import { cartaControlTooltips } from "@/tools/carta-control/carta-control-tooltips";
import { exportAsPdf, exportAsPng, exportAsSvg } from "@/lib/export/client-export";
import type { ExportFormat, ExportOptions } from "@/lib/export/types";
import { serializeToXml, parseFromXml } from "@/tools/carta-control/xml";
import {
  cartaControlExportLayouts,
  cartaControlExportFields,
} from "@/tools/carta-control/types";
import type { ControlChartPoint } from "@/tools/carta-control/types";
import { useCartaControlStore } from "@/tools/carta-control/store";
import { useDocsStore } from "@/store/docs-store";
import { ExportChart } from "@/tools/carta-control/components/export-chart";
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

type ViewMode = "display" | "edit";

interface CartaControlEditorProps {
  docId: string;
}

export function CartaControlEditor({ docId }: CartaControlEditorProps) {
  const exportAreaRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [view, setView] = useState<ViewMode>("display");
  const [editingPoint, setEditingPoint] = useState<ControlChartPoint | null>(null);
  const [displayRange, setDisplayRange] = useState<PointRange | null>(null);
  const loadedRef = useRef(false);

  const root = useCartaControlStore((state) => state.root);
  const setTitle = useCartaControlStore((state) => state.setTitle);
  const setUnit = useCartaControlStore((state) => state.setUnit);
  const replaceRoot = useCartaControlStore((state) => state.replaceRoot);
  const resetDiagram = useCartaControlStore((state) => state.reset);

  const docTitle = useDocsStore((state) => state.getDoc(docId))?.title ?? "Sin titulo";
  const getDocData = useDocsStore((state) => state.getDocData);
  const setDocData = useDocsStore((state) => state.setDocData);
  const renameDoc = useDocsStore((state) => state.renameDoc);

  useEffect(() => {
    if (loadedRef.current) return;
    const data = getDocData(docId);
    if (data) {
      replaceRoot(data as never);
    }
    const hasPoints =
      useCartaControlStore.getState().root.points.length > 0;
    setView(hasPoints ? "display" : "edit");
    loadedRef.current = true;
  }, [docId, getDocData, replaceRoot]);

  useEffect(() => {
    if (!loadedRef.current) return;
    setDocData(docId, root);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

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

  const downloadXml = useCallback((): void => {
    const xml = serializeToXml(root);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${docTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") || "carta-control"}.xml`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    pushFeedback("success", "Archivo XML descargado.");
  }, [root, docTitle]);

  const handleLoadXml = useCallback(async (file: File): Promise<void> => {
    const text = await file.text();
    try {
      const chart = parseFromXml(text);
      replaceRoot(chart);
      setView(chart.points.length > 0 ? "display" : "edit");
      pushFeedback("success", "XML cargado correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el XML.";
      pushFeedback("error", message);
    }
  }, [replaceRoot]);

  const { exportOptions, registerToolMenus } = useToolMenus();

  const exportDescriptor = useMemo<ExportDescriptor | null>(() => ({
    docId,
    toolId: "carta-control",
    title: docTitle,
    layouts: cartaControlExportLayouts,
    fields: cartaControlExportFields,
    formats: ["svg", "png", "pdf"],
    renderPreview: (opts: ExportOptions) => (
      <ExportChart chart={root} options={opts} />
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
        const message = error instanceof Error ? error.message : "No se pudo exportar la carta.";
        pushFeedback("error", message);
      }
    },
  }), [docId, docTitle, root]);

  const fileDescriptor = useMemo<FileDescriptor | null>(() => ({
    docId,
    toolId: "carta-control",
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

      <header className="shrink-0 rounded-lg border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-4">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cartaControlTooltips.title.label}
                </label>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-flex cursor-default">
                      <Info className="size-3 text-muted-foreground/60" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{cartaControlTooltips.title.tip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input value={root.title} onChange={(event) => setTitle(event.target.value)} />
            </div>

            <div className="w-full max-w-[8rem] space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {cartaControlTooltips.unit.label}
                </label>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="inline-flex cursor-default">
                      <Info className="size-3 text-muted-foreground/60" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{cartaControlTooltips.unit.tip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Input
                value={root.unit}
                placeholder="mm"
                onChange={(event) => setUnit(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
            <Button
              variant={view === "display" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("display")}
              title={cartaControlTooltips.view_display.tip}
            >
              <Eye className="mr-1 size-4" /> Vista
            </Button>
            <Button
              variant={view === "edit" ? "default" : "ghost"}
              size="sm"
              onClick={() => setView("edit")}
              title={cartaControlTooltips.view_edit.tip}
            >
              <Pencil className="mr-1 size-4" /> Edicion
            </Button>
          </div>
        </div>
      </header>

      {view === "display" ? (
        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-lg border bg-card p-4">
          <section className="shrink-0">
            <DisplayControls points={root.points} onChange={setDisplayRange} />
          </section>
          <section className="min-h-0 flex-1">
            <ChartCanvas chart={root} range={displayRange ?? undefined} />
          </section>
        </main>
      ) : (
        <main className="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain lg:grid-cols-[1fr_320px]">
          <div className="flex min-h-0 flex-col gap-4">
            <section className="h-[360px] rounded-lg border bg-card p-4">
              <ChartCanvas
                chart={root}
                onPointClick={(point) => setEditingPoint(point)}
              />
            </section>
            <section className="rounded-lg border bg-card p-4">
              <PointsTable
                points={root.points}
                chart={root}
                onEdit={(point) => setEditingPoint(point)}
              />
            </section>
          </div>
          <aside className="flex flex-col gap-4">
            <ChartParams chart={root} />
            <div className="rounded-lg border bg-card/60 p-3">
              <ImportCsvDialog />
            </div>
          </aside>
        </main>
      )}

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

      {editingPoint ? (
        <PointEditDialog
          point={editingPoint}
          onClose={() => setEditingPoint(null)}
        />
      ) : null}

      <section className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
        <div ref={exportAreaRef}>
          <ExportChart chart={root} options={exportOptions} />
        </div>
      </section>
    </div>
  );
}
