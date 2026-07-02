"use client";

import { useEffect, useRef } from "react";

import { useDocsStore } from "@/store/docs-store";
import { useProcessMapStore } from "@/tools/mapa-proceso-extendido/store";
import type { ProcessMap } from "@/tools/mapa-proceso-extendido/types";

interface ProcessMapEditorProps {
  docId: string;
}

export function ProcessMapEditor({ docId }: ProcessMapEditorProps) {
  const root = useProcessMapStore((s) => s.root);
  const setTitle = useProcessMapStore((s) => s.setTitle);
  const replaceRoot = useProcessMapStore((s) => s.replaceRoot);

  const getDocData = useDocsStore((s) => s.getDocData);
  const setDocData = useDocsStore((s) => s.setDocData);
  const renameDoc = useDocsStore((s) => s.renameDoc);
  const docTitle = useDocsStore((s) => s.getDoc(docId)?.title) ?? "";

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

  return (
    <div className="flex flex-col gap-4">
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

      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="text-sm">Editor del mapa de proceso</p>
        <p className="text-xs mt-1">
          Las secciones de departamentos, etapas, actividades y diagrama se
          implementarán próximamente.
        </p>
      </div>
    </div>
  );
}
