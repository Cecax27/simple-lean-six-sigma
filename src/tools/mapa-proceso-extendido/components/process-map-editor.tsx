"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle, X } from "lucide-react";

import { useDocsStore } from "@/store/docs-store";
import { serializeToXml, parseFromXml } from "@/tools/mapa-proceso-extendido/xml";
import { useProcessMapStore } from "@/tools/mapa-proceso-extendido/store";
import type { ProcessMap } from "@/tools/mapa-proceso-extendido/types";
import { ActivityTable } from "@/tools/mapa-proceso-extendido/components/activity-table";
import { LaneManager } from "@/tools/mapa-proceso-extendido/components/lane-manager";
import { useToolMenus, type FileDescriptor } from "@/components/platform/tool-menus-context";

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

  const getDocData = useDocsStore((s) => s.getDocData);
  const setDocData = useDocsStore((s) => s.setDocData);
  const renameDoc = useDocsStore((s) => s.renameDoc);
  const docTitle = useDocsStore((s) => s.getDoc(docId)?.title) ?? "";

  const { registerToolMenus } = useToolMenus();

  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    const data = getDocData(docId);
    if (data) replaceRoot(data as ProcessMap);
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

      <div className="flex items-center gap-2">
        <label htmlFor="map-title" className="text-sm font-medium whitespace-nowrap">
          Título del mapa
        </label>
        <input
          id="map-title"
          type="text"
          value={root.title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Nombre del proceso"
        />
      </div>

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
    </div>
  );
}
