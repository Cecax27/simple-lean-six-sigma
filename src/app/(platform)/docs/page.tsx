"use client";

import { ArrowRight, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDocsStore } from "@/store/docs-store";
import type { DocMeta } from "@/store/docs-store";
import type { ToolId } from "@/tools/registry";

export default function DocsPage() {
  const docs = useDocsStore((state) => state.docs);
  const createDoc = useDocsStore((state) => state.createDoc);
  const deleteDoc = useDocsStore((state) => state.deleteDoc);
  const renameDoc = useDocsStore((state) => state.renameDoc);
  const migrateFromLegacy = useDocsStore((state) => state.migrateFromLegacy);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    migrateFromLegacy();
  }, [migrateFromLegacy]);

  const docList = Object.values(docs).sort((a, b) => b.updatedAt - a.updatedAt);

  function handleCreateSipoc() {
    const id = createDoc("sipoc", "Nuevo diagrama SIPOC");
    setEditingId(id);
    setEditTitle("Nuevo diagrama SIPOC");
  }

  function handleCreateIshikawa() {
    const id = createDoc("ishikawa", "Nuevo diagrama Ishikawa");
    setEditingId(id);
    setEditTitle("Nuevo diagrama Ishikawa");
  }

  function handleRename(id: string) {
    if (editTitle.trim()) {
      renameDoc(id, editTitle.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="space-y-6 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Mis documentos</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona tus diagramas y analisis guardados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateSipoc} size="sm" className="gap-2">
            <Plus className="size-4" /> Nuevo SIPOC
          </Button>
          <Button onClick={handleCreateIshikawa} size="sm" className="gap-2">
            <Plus className="size-4" /> Nuevo Ishikawa
          </Button>
        </div>
      </div>

      {docList.length === 0 ? (
        <Card className="bg-card/60">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FileText className="size-12 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">No hay documentos guardados</p>
              <p className="text-xs text-muted-foreground">
                Crea tu primer diagrama SIPOC para empezar.
              </p>
            </div>
            <Button onClick={handleCreateSipoc} size="sm">
              <Plus className="mr-2 size-4" /> Nuevo SIPOC
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {docList.map((doc) => (
            <DocRow
              key={doc.id}
              doc={doc}
              editing={editingId === doc.id}
              editTitle={editTitle}
              onStartEdit={() => {
                setEditingId(doc.id);
                setEditTitle(doc.title);
              }}
              onSaveEdit={() => handleRename(doc.id)}
              onDelete={() => deleteDoc(doc.id)}
              onEditTitleChange={setEditTitle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DocRow({
  doc,
  editing,
  editTitle,
  onStartEdit,
  onSaveEdit,
  onDelete,
  onEditTitleChange,
}: {
  doc: DocMeta;
  editing: boolean;
  editTitle: string;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onEditTitleChange: (value: string) => void;
}) {
  return (
    <Card className="bg-card/80">
      <CardContent className="flex items-center gap-3 py-3">
        <FileText className="size-5 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          {editing ? (
            <Input
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onBlur={onSaveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onSaveEdit();
              }}
              className="h-8 text-sm"
              autoFocus
            />
          ) : (
            <div>
              <p
                className="cursor-pointer text-sm font-medium"
                onClick={onStartEdit}
                title="Clic para renombrar"
              >
                {doc.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(doc.updatedAt).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!editing && (
            <>
              <Link href={`/${doc.toolId}/${doc.id}`}>
                <Button variant="ghost" size="icon-sm" title="Abrir">
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onDelete}
                title="Eliminar"
                className="text-rose-600 hover:text-rose-700"
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
