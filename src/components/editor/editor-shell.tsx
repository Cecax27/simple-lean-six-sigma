"use client";

import { AlertCircle, CheckCircle2, Download, FileUp, FileType2, ImageDown, Info, RotateCcw, VectorSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { BreadcrumbNav } from "@/components/editor/breadcrumb-nav";
import { DesktopSidebar, MobileSidebar } from "@/components/editor/editor-sidebar";
import { ExportDiagram } from "@/components/editor/export-diagram";
import { ProcessList } from "@/components/editor/process-list";
import { SettingsPanel } from "@/components/editor/settings-panel";
import { SectionCard } from "@/components/editor/section-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const sidebarCollapsed = usePreferencesStore((state) => state.sidebarCollapsed);
  const toggleSidebar = usePreferencesStore((state) => state.toggleSidebar);

  const root = useSipocStore((state) => state.root);
  const path = useSipocStore((state) => state.path);
  const setTitle = useSipocStore((state) => state.setTitle);
  const addItem = useSipocStore((state) => state.addItem);
  const removeItem = useSipocStore((state) => state.removeItem);
  const addProcess = useSipocStore((state) => state.addProcess);
  const removeProcess = useSipocStore((state) => state.removeProcess);
  const enterProcess = useSipocStore((state) => state.enterProcess);
  const navigateToLevel = useSipocStore((state) => state.navigateToLevel);
  const replaceRoot = useSipocStore((state) => state.replaceRoot);
  const reset = useSipocStore((state) => state.reset);
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

  return (
    <div className="flex min-h-[calc(100vh-2rem)] gap-4">
      <DesktopSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="min-w-0 flex-1 space-y-5">
        <header className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <MobileSidebar
                mobileOpen={mobileMenuOpen}
                onMobileOpenChange={setMobileMenuOpen}
                onOpenSettings={() => setSettingsOpen(true)}
              />
              <div>
                <h1 className="text-lg font-semibold">Editor SIPOC</h1>
                <p className="text-sm text-muted-foreground">Minimalista, basado en XML y con anidamiento.</p>
              </div>
            </div>

            <div className="w-full overflow-x-auto md:w-auto">
              <div className="flex w-max items-center gap-2 rounded-md border bg-muted/20 p-1">
                <Button variant="outline" size="sm" onClick={downloadXml}>
                  <Download className="mr-2 h-4 w-4" /> Descargar XML
                </Button>

                <Button variant="outline" size="sm" onClick={() => handleExport("svg")} disabled={isExporting}>
                  <VectorSquare className="mr-2 h-4 w-4" /> Exportar SVG
                </Button>

                <Button variant="outline" size="sm" onClick={() => handleExport("png")} disabled={isExporting}>
                  <ImageDown className="mr-2 h-4 w-4" /> Exportar PNG
                </Button>

                <Button variant="outline" size="sm" onClick={() => handleExport("pdf")} disabled={isExporting}>
                  <FileType2 className="mr-2 h-4 w-4" /> Exportar PDF
                </Button>

                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <FileUp className="mr-2 h-4 w-4" /> Cargar XML
                </Button>

                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar
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
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Titulo del diagrama actual</label>
            <Input value={current.title} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <BreadcrumbNav root={root} path={path} onNavigate={navigateToLevel} />
            <span className="text-xs text-muted-foreground">
              Nivel actual: {path.length + 1} de {MAX_NESTING_DEPTH + 1}
            </span>
          </div>

          {feedback && feedbackMeta ? (
            <Alert className="mt-3" variant={feedbackMeta.variant}>
              <feedbackMeta.icon />
              <AlertTitle>{feedbackMeta.title}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          ) : null}
        </header>

        <main className="grid gap-4 rounded-lg border bg-card p-4 lg:grid-cols-5">
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
