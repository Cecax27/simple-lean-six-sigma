"use client";

import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Download, FileUp, Info, RotateCcw, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BreadcrumbNav } from "@/tools/sipoc/components/breadcrumb-nav";
import { ExportDiagram } from "@/tools/sipoc/components/export-diagram";
import { ProcessList } from "@/tools/sipoc/components/process-list";
import { SectionCard } from "@/tools/sipoc/components/section-card";
import { SipocTreePanel } from "@/tools/sipoc/components/sipoc-tree-panel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { exportAsPdf, exportAsPng, exportAsSvg } from "@/lib/export/client-export";
import { MAX_NESTING_DEPTH } from "@/tools/sipoc/tree";
import { serializeToXml, parseFromXml } from "@/tools/sipoc/xml";
import { useSipocStore } from "@/tools/sipoc/store";
import { useDocsStore } from "@/store/docs-store";
import type { ExportFormat } from "@/tools/sipoc/types";

type FeedbackTone = "info" | "success" | "error";

interface FeedbackMessage {
  tone: FeedbackTone;
  message: string;
}

interface SipocEditorProps {
  docId: string;
}

export function SipocEditor({ docId }: SipocEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportAreaRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");
  const [headerCollapsed, setHeaderCollapsed] = useState<boolean>(false);
  const [treePanelOpen, setTreePanelOpen] = useState<boolean>(false);
  const loadedRef = useRef(false);

  const root = useSipocStore((state) => state.root);
  const path = useSipocStore((state) => state.path);
  const setTitle = useSipocStore((state) => state.setTitle);
  const setProcessStart = useSipocStore((state) => state.setProcessStart);
  const setProcessEnd = useSipocStore((state) => state.setProcessEnd);
  const addItem = useSipocStore((state) => state.addItem);
  const removeItem = useSipocStore((state) => state.removeItem);
  const addProcess = useSipocStore((state) => state.addProcess);
  const removeProcess = useSipocStore((state) => state.removeProcess);
  const enterProcess = useSipocStore((state) => state.enterProcess);
  const navigateToLevel = useSipocStore((state) => state.navigateToLevel);
  const replaceRoot = useSipocStore((state) => state.replaceRoot);
  const resetDiagram = useSipocStore((state) => state.reset);
  const getCurrent = useSipocStore((state) => state.getCurrent);

  const docTitle = useDocsStore((state) => state.getDoc(docId))?.title ?? "Sin titulo";
  const getDocData = useDocsStore((state) => state.getDocData);
  const setDocData = useDocsStore((state) => state.setDocData);
  const renameDoc = useDocsStore((state) => state.renameDoc);

  const current = getCurrent();
  const pathLabels = [root.title];
  let pointer = root;
  for (const processId of path) {
    const process = pointer.processes.find((entry) => entry.id === processId);
    if (!process) break;
    pathLabels.push(process.label);
    pointer = process.child ?? pointer;
  }

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

  function downloadXml(): void {
    const xml = serializeToXml(root);
    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${docTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "") || "diagrama-sipoc"}.xml`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    pushFeedback("success", "Archivo XML descargado.");
  }

  async function handleLoadXml(file: File): Promise<void> {
    const text = await file.text();
    try {
      const diagram = parseFromXml(text);
      replaceRoot(diagram);
      pushFeedback("success", "XML cargado correctamente.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el XML.";
      pushFeedback("error", message);
    }
  }

  async function handleExport(format: ExportFormat): Promise<void> {
    if (!exportAreaRef.current) {
      pushFeedback("error", "No se encontro el area para exportar.");
      return;
    }
    setIsExporting(true);
    try {
      if (format === "svg") {
        await exportAsSvg(exportAreaRef.current, current.title);
        pushFeedback("success", "Exportacion SVG completada.");
      } else if (format === "png") {
        await exportAsPng(exportAreaRef.current, current.title);
        pushFeedback("success", "Exportacion PNG completada.");
      } else {
        await exportAsPdf(exportAreaRef.current, current.title);
        pushFeedback("success", "Exportacion PDF completada.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo exportar el diagrama.";
      pushFeedback("error", message);
    } finally {
      setIsExporting(false);
    }
  }

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

  const exportMeta: Record<ExportFormat, { label: string }> = {
    svg: { label: "SVG" },
    png: { label: "PNG" },
    pdf: { label: "PDF" },
  };

  return (
    <div className="flex h-full min-h-0 gap-4 overflow-hidden">
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

      {/* Tree panel */}
      {treePanelOpen && (
        <aside className="hidden h-full w-64 shrink-0 overflow-y-auto rounded-xl border bg-card p-3 shadow-sm md:block">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Arbol SIPOC
            </span>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setTreePanelOpen(false)}
              aria-label="Cerrar panel de arbol"
            >
              <PanelRightClose className="size-4" />
            </Button>
          </div>
          <SipocTreePanel />
        </aside>
      )}

      {/* Main content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BreadcrumbNav root={root} path={path} onNavigate={navigateToLevel} />
              <span className="text-xs text-muted-foreground">
                Nivel: {path.length + 1}/{MAX_NESTING_DEPTH + 1}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!treePanelOpen && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setTreePanelOpen(true)}
                  aria-label="Abrir arbol SIPOC"
                  title="Arbol SIPOC"
                >
                  <PanelRightOpen className="size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setHeaderCollapsed((prev) => !prev)}
                aria-label={headerCollapsed ? "Expandir encabezado" : "Colapsar encabezado"}
                title={headerCollapsed ? "Expandir encabezado" : "Colapsar encabezado"}
              >
                {headerCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
              </Button>
            </div>
          </div>

          <input
            className="hidden"
            ref={fileInputRef}
            type="file"
            accept=".xml,application/xml,text/xml"
            onChange={async (event) => {
              const input = event.currentTarget;
              const file = input.files?.[0];
              if (!file) return;
              await handleLoadXml(file);
              input.value = "";
            }}
          />

          <div className={headerCollapsed ? "hidden" : undefined}>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Nombre del proceso
                  </label>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex cursor-default">
                        <Info className="size-3 text-muted-foreground/60" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>El proceso central que describe este diagrama SIPOC.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input value={current.title} onChange={(event) => setTitle(event.target.value)} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Inicio del proceso
                  </label>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex cursor-default">
                        <Info className="size-3 text-muted-foreground/60" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>El evento o actividad que da comienzo al proceso.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={current.processStart ?? ""}
                  placeholder="Ej. Solicitud de cliente recibida"
                  onChange={(event) => setProcessStart(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Fin del proceso
                  </label>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="inline-flex cursor-default">
                        <Info className="size-3 text-muted-foreground/60" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>El evento o entregable que marca el cierre del proceso.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={current.processEnd ?? ""}
                  placeholder="Ej. Producto entregado y confirmado"
                  onChange={(event) => setProcessEnd(event.target.value)}
                />
              </div>
            </div>
          </div>
        </header>

        {/* 5-column grid */}
        <main className="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain rounded-lg border bg-card p-4 lg:grid-cols-5 lg:overflow-hidden">
          <SectionCard
            title="Proveedores"
            items={current.suppliers}
            onAdd={(label) => addItem("suppliers", label)}
            onRemove={(id) => removeItem("suppliers", id)}
          />
          <SectionCard
            title="Entradas"
            items={current.inputs}
            onAdd={(label) => addItem("inputs", label)}
            onRemove={(id) => removeItem("inputs", id)}
          />
          <ProcessList
            processes={current.processes}
            canEnterSubprocess={path.length < MAX_NESTING_DEPTH}
            onAdd={addProcess}
            onRemove={removeProcess}
            onEnter={enterProcess}
          />
          <SectionCard
            title="Salidas"
            items={current.outputs}
            onAdd={(label) => addItem("outputs", label)}
            onRemove={(id) => removeItem("outputs", id)}
          />
          <SectionCard
            title="Clientes"
            items={current.customers}
            onAdd={(label) => addItem("customers", label)}
            onRemove={(id) => removeItem("customers", id)}
          />
        </main>

        {/* Toolbar */}
        <footer className="flex shrink-0 flex-wrap items-center gap-2 rounded-lg border bg-card/60 p-3">
          <Button
            variant="outline"
            size="sm"
            className="justify-start border-sky-300 text-sky-700 hover:bg-sky-50"
            onClick={downloadXml}
          >
            <Download className="mr-2 size-4" /> Descargar XML
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start border-amber-300 text-amber-700 hover:bg-amber-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp className="mr-2 size-4" /> Cargar XML
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="justify-start border-rose-300 text-rose-700 hover:bg-rose-50"
            onClick={resetDiagram}
          >
            <RotateCcw className="mr-2 size-4" /> Reiniciar
          </Button>

          <div className="flex items-center gap-2 rounded-md border border-border/80 px-2 py-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Exportar
            </span>
            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="svg">SVG</SelectItem>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => handleExport(exportFormat)}
              disabled={isExporting}
            >
              {isExporting ? "Exportando..." : exportMeta[exportFormat].label}
            </Button>
          </div>
        </footer>

        {/* Hidden export area */}
        <section className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
          <div ref={exportAreaRef}>
            <ExportDiagram diagram={current} pathLabels={pathLabels} />
          </div>
        </section>
      </div>
    </div>
  );
}
