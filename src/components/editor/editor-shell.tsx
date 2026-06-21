"use client";

import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BreadcrumbNav } from "@/components/editor/breadcrumb-nav";
import { DesktopSidebar, MobileSidebar } from "@/components/editor/editor-sidebar";
import { ExportDiagram } from "@/components/editor/export-diagram";
import { ProcessList } from "@/components/editor/process-list";
import { SettingsPanel } from "@/components/editor/settings-panel";
import { SectionCard } from "@/components/editor/section-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { exportAsPdf, exportAsPng, exportAsSvg } from "@/lib/export/client-export";
import { MAX_NESTING_DEPTH } from "@/lib/sipoc-tree";
import { parseFromXml, serializeToXml } from "@/lib/xml";
import { usePreferencesStore } from "@/store/preferences-store";
import { useSipocStore } from "@/store/sipoc-store";

const STORAGE_KEY = "simple-sipoc-autosave-v1";

type FeedbackTone = "info" | "success" | "error";

interface FeedbackMessage {
  tone: FeedbackTone;
  message: string;
}

export function EditorShell() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportAreaRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"svg" | "png" | "pdf">("svg");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);

  const root = useSipocStore((state) => state.root);
  const path = useSipocStore((state) => state.path);
  const setTitle = useSipocStore((state) => state.setTitle);
    const setProcessStart = useSipocStore((state) => state.setProcessStart);
    const setProcessEnd = useSipocStore((state) => state.setProcessEnd);
    const [headerCollapsed, setHeaderCollapsed] = useState<boolean>(false);
  const addItem = useSipocStore((state) => state.addItem);
  const removeItem = useSipocStore((state) => state.removeItem);
  const addProcess = useSipocStore((state) => state.addProcess);
  const removeProcess = useSipocStore((state) => state.removeProcess);
  const enterProcess = useSipocStore((state) => state.enterProcess);
  const navigateToLevel = useSipocStore((state) => state.navigateToLevel);
  const replaceRoot = useSipocStore((state) => state.replaceRoot);
  const resetDiagram = useSipocStore((state) => state.reset);
  const getCurrent = useSipocStore((state) => state.getCurrent);

  const current = getCurrent();
  const pathLabels = [root.title];
  let pointer = root;
  for (const processId of path) {
    const process = pointer.processes.find((entry) => entry.id === processId);
    if (!process) {
      break;
    }
    pathLabels.push(process.label);
    pointer = process.child ?? pointer;
  }

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const restored = parseFromXml(raw);
      replaceRoot(restored);
    } catch {}
  }, [replaceRoot]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, serializeToXml(root));
    } catch {
      // No interrumpe el flujo de edicion si localStorage falla.
    }
  }, [root]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 3600);

    return () => {
      window.clearTimeout(timeoutId);
    };
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
    anchor.download = "diagrama-sipoc.xml";
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

  async function handleExport(format: "svg" | "png" | "pdf"): Promise<void> {
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

  return (
    <div className="flex h-[calc(100dvh-2rem)] min-h-0 gap-4 overflow-hidden md:h-[calc(100dvh-3rem)]">
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

      <DesktopSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onOpenSettings={() => setSettingsOpen(true)}
        onDownloadXml={downloadXml}
        onOpenXmlPicker={() => fileInputRef.current?.click()}
        onReset={resetDiagram}
        onExport={() => handleExport(exportFormat)}
        onExportFormatChange={setExportFormat}
        exportFormat={exportFormat}
        isExporting={isExporting}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-hidden">
        <header className="shrink-0 rounded-lg border bg-card p-4">
          {/* Fila superior: controles de navegación + botón de colapso */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MobileSidebar
                mobileOpen={mobileMenuOpen}
                onMobileOpenChange={setMobileMenuOpen}
                onOpenSettings={() => setSettingsOpen(true)}
                onDownloadXml={downloadXml}
                onOpenXmlPicker={() => fileInputRef.current?.click()}
                onReset={resetDiagram}
                onExport={() => handleExport(exportFormat)}
                onExportFormatChange={setExportFormat}
                exportFormat={exportFormat}
                isExporting={isExporting}
              />
              <div className="flex flex-wrap items-center gap-2">
                <BreadcrumbNav root={root} path={path} onNavigate={navigateToLevel} />
                <span className="text-xs text-muted-foreground">
                  Nivel: {path.length + 1}/{MAX_NESTING_DEPTH + 1}
                </span>
              </div>
            </div>
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

          <input
            className="hidden"
            ref={fileInputRef}
            type="file"
            accept=".xml,application/xml,text/xml"
            onChange={async (event) => {
              const input = event.currentTarget;
              const file = input.files?.[0];
              if (!file) {
                return;
              }
              await handleLoadXml(file);
              input.value = "";
            }}
          />

          {/* Campos colapsables */}
          <div className={headerCollapsed ? "hidden" : undefined}>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Nombre del proceso */}
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

              {/* Inicio del proceso */}
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

              {/* Fin del proceso */}
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

        <main className="grid min-h-0 flex-1 gap-4 overflow-y-auto overscroll-contain rounded-lg border bg-card p-4 lg:grid-cols-5">
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

        <section className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden>
          <div ref={exportAreaRef}>
            <ExportDiagram diagram={current} pathLabels={pathLabels} />
          </div>
        </section>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Configuraciones</DialogTitle>
              <DialogDescription>Personaliza la apariencia y comportamiento de la herramienta.</DialogDescription>
            </DialogHeader>
            <SettingsPanel />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
