"use client";

import { FileUp } from "lucide-react";
import { useState } from "react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { parseCsvToPoints } from "@/tools/carta-control/csv";
import { useCartaControlStore } from "@/tools/carta-control/store";

export function ImportCsvDialog() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"append" | "replace">("append");
  const [error, setError] = useState<string | null>(null);

  const setPoints = useCartaControlStore((state) => state.setPoints);
  const appendPoints = useCartaControlStore((state) => state.appendPoints);

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
            Pega una fila por punto. Formatos aceptados:{" "}
            <code className="rounded bg-muted px-1">&quot;valor&quot;</code>,{" "}
            <code className="rounded bg-muted px-1">&quot;etiqueta,valor&quot;</code> o{" "}
            <code className="rounded bg-muted px-1">&quot;etiqueta,valor,comentario&quot;</code>.
            Separa con coma, punto y coma o tabulador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4">
          <Textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={"Lote 1,5.2\nLote 2,4.8\nLote 3,6.1"}
            className="min-h-32 font-mono text-sm"
          />

          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value === "replace" ? "replace" : "append")}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="append" id="csv-append" />
              <label htmlFor="csv-append" className="text-sm">
                Anexar a los puntos existentes
              </label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="replace" id="csv-replace" />
              <label htmlFor="csv-replace" className="text-sm">
                Reemplazar todos los puntos
              </label>
            </div>
          </RadioGroup>

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
