"use client";

import { FileUp, Upload } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { parseCsvToPoints } from "@/tools/carta-control/csv";
import { useCartaControlStore } from "@/tools/carta-control/store";

type ImportMode = "append" | "replace";

export function ImportCsvDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<ImportMode>("append");
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setPoints = useCartaControlStore((state) => state.setPoints);
  const appendPoints = useCartaControlStore((state) => state.appendPoints);

  function applyText(value: string, name: string | null) {
    setText(value);
    setFileName(name);
    setError(null);
  }

  function handleFile(file: File | undefined | null) {
    if (!file) return;
    if (!/\.csv$/i.test(file.name) && file.type !== "text/csv") {
      setError("El archivo debe ser un CSV.");
      return;
    }
    file
      .text()
      .then((content) => applyText(content, file.name))
      .catch(() => setError("No se pudo leer el archivo."));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  function handleImport() {
    const result = parseCsvToPoints(text);
    if (result.points.length === 0) {
      setError("No se pudieron leer puntos validos. Revisa el formato.");
      return;
    }
    setError(null);
    if (mode === "replace") {
      setPoints(result.points);
    } else {
      appendPoints(result.points);
    }
    setText("");
    setFileName(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <FileUp className="size-4" /> Importar CSV
          </Button>
        }
      />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar puntos desde CSV</DialogTitle>
          <DialogDescription>
            Sube o arrastra un archivo CSV, o pega el contenido. Formatos aceptados:{" "}
            <code className="rounded bg-muted px-1">&quot;valor&quot;</code>,{" "}
            <code className="rounded bg-muted px-1">&quot;etiqueta,valor&quot;</code> o{" "}
            <code className="rounded bg-muted px-1">&quot;etiqueta,valor,comentario&quot;</code>.
            Separa con coma, punto y coma o tabulador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4">
          <div
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/30 hover:border-muted-foreground/60 hover:bg-muted/40",
            )}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <Upload className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {fileName ? (
                <span className="font-medium text-foreground">{fileName}</span>
              ) : (
                <>
                  Arrastra un archivo <span className="font-medium">.csv</span> aqui o{" "}
                  <span className="font-medium text-primary">haz clic para subirlo</span>
                </>
              )}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                handleFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>

          <Textarea
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setFileName(null);
            }}
            placeholder={"Lote 1,5.2\nLote 2,4.8\nLote 3,6.1"}
            className="min-h-28 font-mono text-sm"
          />

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Modo de importacion
            </label>
            <div className="flex items-center gap-1 rounded-lg border bg-muted/40 p-1">
              <Button
                type="button"
                variant={mode === "append" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setMode("append")}
              >
                Anexar
              </Button>
              <Button
                type="button"
                variant={mode === "replace" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
                onClick={() => setMode("replace")}
              >
                Reemplazar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {mode === "append"
                ? "Los nuevos puntos se agregan al final de los existentes."
                : "Los puntos existentes se eliminan y se reemplazan por los importados."}
            </p>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!text.trim()}>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
