"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowRightLeft, CheckCircle, Play, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDocsStore } from "@/store/docs-store";
import { serializeToXml, parseFromXml } from "@/tools/mapa-proceso-extendido/xml";
import { generateLayout } from "@/tools/mapa-proceso-extendido/layout";
import { useProcessMapStore } from "@/tools/mapa-proceso-extendido/store";
import type { ProcessMap } from "@/tools/mapa-proceso-extendido/types";
import { ActivityTable } from "@/tools/mapa-proceso-extendido/components/activity-table";
import { FlowchartCanvas } from "@/tools/mapa-proceso-extendido/components/flowchart-canvas";
import { LaneManager } from "@/tools/mapa-proceso-extendido/components/lane-manager";
import { useToolMenus, type FileDescriptor } from "@/components/platform/tool-menus-context";

type ViewMode = "table" | "diagram";

interface FeedbackMessage {
  type: "success" | "error";
  message: string;
}

interface ProcessMapEditorProps {
  docId: string;
}

export function ProcessMapEditor({ docId }: ProcessMapEditorProps) {
  const root = useProcessMapStore((s) => s.root);
  const setTitle = useProcessMapStore((s) => s.setTitle);
  const replaceRoot = useProcessMapStore((s) => s.replaceRoot);
  const addDepartment = useProcessMapStore((s) => s.addDepartment);
  const updateDepartment = useProcessMapStore((s) => s.updateDepartment);
  const removeDepartment = useProcessMapStore((s) => s.removeDepartment);
  const moveDepartmentUp = useProcessMapStore((s) => s.moveDepartmentUp);
  const moveDepartmentDown = useProcessMapStore((s) => s.moveDepartmentDown);
  const addStage = useProcessMapStore((s) => s.addStage);
  const updateStage = useProcessMapStore((s) => s.updateStage);
  const removeStage = useProcessMapStore((s) => s.removeStage);
  const moveStageUp = useProcessMapStore((s) => s.moveStageUp);
  const moveStageDown = useProcessMapStore((s) => s.moveStageDown);
  const setFlowchart = useProcessMapStore((s) => s.setFlowchart);

  const getDocData = useDocsStore((s) => s.getDocData);
  const setDocData = useDocsStore((s) => s.setDocData);
  const renameDoc = useDocsStore((s) => s.renameDoc);
  const docTitle = useDocsStore((s) => s.getDoc(docId)?.title) ?? "";

  const { registerToolMenus } = useToolMenus();

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [flowchartVersion, setFlowchartVersion] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    const data = getDocData(docId);
    if (data) {
      replaceRoot(data as ProcessMap);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlowchartVersion((v) => v + 1);
    }
    loadedRef.current = true;
  }, [docId, getDocData, replaceRoot]);

  useEffect(() => {
    if (!loadedRef.current) return;
    setDocData(docId, root);
  }, [root, docId, setDocData]);

  useEffect(() => {
    if (!loadedRef.current) return;
    if (root.title && root.title !== docTitle) renameDoc(docId, root.title);
  }, [root.title, docId, docTitle, renameDoc]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3600);
    return () => clearTimeout(timer);
  }, [feedback]);

  const dataHash = useMemo(() => {
    const deps = root.departments.map((d) => `${d.id}:${d.name}`).join(",");
    const stgs = root.stages.map((s) => `${s.id}:${s.name}`).join(",");
    const acts = root.activities
      .map((a) => `${a.id}:${a.name}:${a.type}:${a.stageId}:${a.departmentId}:${a.previousIds.join(".")}:${a.nextIds.join(".")}`)
      .join(";");
    return `${root.nextActivityId}|${deps}|${stgs}|${acts}`;
  }, [root.nextActivityId, root.departments, root.stages, root.activities]);

  const dataHashRef = useRef(dataHash);
  useEffect(() => {
    if (!loadedRef.current) return;
    if (dataHash !== dataHashRef.current) {
      dataHashRef.current = dataHash;
      if (root.flowchart) {
        useProcessMapStore.getState().markStale();
      }
    }
  }, [dataHash, root.flowchart]);

  const downloadXml = useCallback(() => {
    try {
      const xml = serializeToXml(root);
      const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docTitle.replace(/\s+/g, "_").toLowerCase()}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedback({ type: "success", message: "Archivo XML descargado correctamente." });
    } catch {
      setFeedback({ type: "error", message: "No se pudo generar el archivo XML." });
    }
  }, [root, docTitle]);

  const handleLoadXml = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const diagram = parseFromXml(text);
        replaceRoot(diagram);
        setFlowchartVersion((v) => v + 1);
        setFeedback({ type: "success", message: "Archivo XML cargado correctamente." });
      } catch {
        setFeedback({
          type: "error",
          message: "El archivo no contiene un mapa de proceso válido.",
        });
      }
    },
    [replaceRoot],
  );

  const fileDescriptor = useMemo<FileDescriptor>(
    () => ({
      docId,
      toolId: "mapa-proceso-extendido",
      title: docTitle,
      fileExtension: "xml",
      save: downloadXml,
      open: handleLoadXml,
    }),
    [docId, docTitle, downloadXml, handleLoadXml],
  );

  useEffect(() => {
    registerToolMenus(null, fileDescriptor);
    return () => registerToolMenus(null, null);
  }, [fileDescriptor, registerToolMenus]);

  function handleGenerate() {
    const layout = generateLayout(root);
    setFlowchart(layout);
    setFlowchartVersion((v) => v + 1);
    setViewMode("diagram");
    setFeedback({ type: "success", message: "Diagrama generado correctamente." });
  }

  function handleRegenerate() {
    const layout = generateLayout(root);
    setFlowchart(layout);
    setFlowchartVersion((v) => v + 1);
    setFeedback({ type: "success", message: "Diagrama regenerado (se descartaron las modificaciones manuales)." });
  }

  const canGenerate =
    root.departments.length > 0 &&
    root.stages.length > 0 &&
    root.activities.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
            feedback.type === "error"
              ? "bg-destructive/10 text-destructive"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          }`}
        >
          {feedback.type === "error" ? (
            <AlertTriangle className="size-4 shrink-0" />
          ) : (
            <CheckCircle className="size-4 shrink-0" />
          )}
          <span className="flex-1">{feedback.message}</span>
          <button
            onClick={() => setFeedback(null)}
            className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <label htmlFor="map-title" className="text-sm font-medium whitespace-nowrap">
            Título del mapa
          </label>
          <input
            id="map-title"
            type="text"
            value={root.title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Nombre del proceso"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {viewMode === "table" ? (
            <Button
              variant="default"
              size="sm"
              className="gap-1.5 h-8"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              <Play className="size-3.5" />
              Generar diagrama
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8"
              onClick={() => setViewMode("table")}
            >
              <ArrowRightLeft className="size-3.5" />
              Volver a tabla
            </Button>
          )}
        </div>
      </div>

      {viewMode === "table" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <LaneManager
              title="Departamentos (columnas)"
              items={root.departments}
              onAdd={addDepartment}
              onUpdate={updateDepartment}
              onRemove={removeDepartment}
              onMoveUp={moveDepartmentUp}
              onMoveDown={moveDepartmentDown}
            />
            <LaneManager
              title="Etapas (filas)"
              items={root.stages}
              onAdd={addStage}
              onUpdate={updateStage}
              onRemove={removeStage}
              onMoveUp={moveStageUp}
              onMoveDown={moveStageDown}
            />
          </div>

          <ActivityTable />
        </>
      ) : (
        <>
          {root.flowchart && (
            <>
              {root.flowchart.stale && (
                <div className="flex items-center gap-3 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-4 py-2.5 text-sm text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span className="flex-1">
                    El diagrama está desactualizado. Regenerar aplicará los cambios de la tabla
                    (se perderán las modificaciones manuales).
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs shrink-0 border-amber-300 dark:border-amber-700"
                    onClick={handleRegenerate}
                  >
                    <Play className="size-3 mr-1" />
                    Regenerar
                  </Button>
                </div>
              )}
              <FlowchartCanvas
                flowchart={root.flowchart}
                departments={root.departments}
                stages={root.stages}
                activities={root.activities}
                version={flowchartVersion}
              />
            </>
          )}
          {!root.flowchart && (
            <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
              <p className="text-sm">No hay diagrama generado.</p>
              <p className="text-xs mt-1">
                Completa la tabla de actividades y haz clic en &quot;Generar diagrama&quot;.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5"
                onClick={() => setViewMode("table")}
              >
                <ArrowRightLeft className="size-3.5" />
                Ir a la tabla
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
