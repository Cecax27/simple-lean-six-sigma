"use client";

import {
  Check,
  Download,
  ImageIcon,
  Palette,
  Ruler,
  Type,
  ToggleLeft,
} from "lucide-react";
import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ExportOptions, ExportSizeUnit } from "@/lib/export/types";
import { EXPORT_COLOR_PRESETS, lightExportColors } from "@/lib/export/types";
import { useToolMenus } from "@/components/platform/tool-menus-context";

interface ExportMenuProps {
  collapsed?: boolean;
}

const SIZE_UNITS: { id: ExportSizeUnit; labelEs: string }[] = [
  { id: "px", labelEs: "px" },
  { id: "cm", labelEs: "cm" },
];

const SIZE_PRESETS: { labelEs: string; value: number; unit: ExportSizeUnit }[] = [
  { labelEs: "A4 horizontal", value: 842, unit: "px" },
  { labelEs: "A4 vertical", value: 595, unit: "px" },
  { labelEs: "Carta horizontal", value: 792, unit: "px" },
  { labelEs: "Carta vertical", value: 612, unit: "px" },
  { labelEs: "Pantalla (HD)", value: 1600, unit: "px" },
  { labelEs: "4K", value: 3840, unit: "px" },
];

function cmToPx(cm: number): number {
  return Math.round(cm * 37.795);
}

export function ExportMenu({ collapsed }: ExportMenuProps) {
  const {
    exportDescriptor: descriptor,
    exportOptions: options,
    setExportOptions,
    setExportColor,
    setExportWatermark,
  } = useToolMenus();

  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const debouncedPreview = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  if (!descriptor) return null;

  function handleExport() {
    if (!descriptor) return;
    setExporting(true);
    descriptor
      .export(options.format, options)
      .catch(() => {})
      .finally(() => setExporting(false));
  }

  function applyColorPreset(colors: typeof lightExportColors) {
    setExportOptions({ colors });
  }

  const toggleField = (fieldId: string) => {
    const next = options.fields.includes(fieldId)
      ? options.fields.filter((f) => f !== fieldId)
      : [...options.fields, fieldId];
    setExportOptions({ fields: next });
  };

  const layoutId = options.layout;
  const currentLayout = descriptor.layouts.find((l) => l.id === layoutId);

  const previewContainer: ReactNode = descriptor.renderPreview(options);

  if (collapsed) {
    return (
      <>
        <DropdownMenuItem onClick={() => setOpen(true)}>
          <ImageIcon className="mr-2 size-4" />
          Exportar...
        </DropdownMenuItem>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden p-0 sm:max-w-5xl">
            <ExportDialogContent
              descriptor={descriptor}
              options={options}
              previewContainer={previewContainer}
              previewKey={previewKey}
              exporting={exporting}
              currentLayout={currentLayout}
              setExportOptions={setExportOptions}
              setExportColor={setExportColor}
              setExportWatermark={setExportWatermark}
              applyColorPreset={applyColorPreset}
              toggleField={toggleField}
              debouncedPreview={debouncedPreview}
              onExport={handleExport}
              onClose={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn("w-full justify-start text-xs")}
          >
            <ImageIcon className="mr-2 size-3.5" />
            Exportar
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden p-0 sm:max-w-5xl">
        <ExportDialogContent
          descriptor={descriptor}
          options={options}
          previewContainer={previewContainer}
          previewKey={previewKey}
          exporting={exporting}
          currentLayout={currentLayout}
          setExportOptions={setExportOptions}
          setExportColor={setExportColor}
          setExportWatermark={setExportWatermark}
          applyColorPreset={applyColorPreset}
          toggleField={toggleField}
          debouncedPreview={debouncedPreview}
          onExport={handleExport}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ExportDialogContent({
  descriptor,
  options,
  previewContainer,
  previewKey,
  exporting,
  currentLayout,
  setExportOptions,
  setExportColor,
  setExportWatermark,
  applyColorPreset,
  toggleField,
  debouncedPreview,
  onExport,
  onClose,
}: {
  descriptor: NonNullable<ReturnType<typeof useToolMenus>["exportDescriptor"]>;
  options: ExportOptions;
  previewContainer: ReactNode;
  previewKey: number;
  exporting: boolean;
  currentLayout: { id: string; labelEs: string } | undefined;
  setExportOptions: ReturnType<typeof useToolMenus>["setExportOptions"];
  setExportColor: ReturnType<typeof useToolMenus>["setExportColor"];
  setExportWatermark: ReturnType<typeof useToolMenus>["setExportWatermark"];
  applyColorPreset: (colors: typeof lightExportColors) => void;
  toggleField: (fieldId: string) => void;
  debouncedPreview: () => void;
  onExport: () => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  const sizePx = options.size.unit === "cm" ? cmToPx(options.size.value) : options.size.value;

  const computeScale = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const availableWidth = canvas.clientWidth;
    if (availableWidth <= 0) return;
    const computed = availableWidth / sizePx;
    setScale(Math.min(computed, 1));
  }, [sizePx]);

  useEffect(() => {
    computeScale();
  }, [computeScale, previewKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => computeScale());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [computeScale]);

  const sizeSelectValue = (() => {
    const preset = SIZE_PRESETS.find(
      (p) => p.value === options.size.value && p.unit === options.size.unit,
    );
    return preset ? String(preset.value) : "";
  })();

  return (
    <div className="flex h-full max-h-[85vh] flex-col">
      <DialogHeader className="shrink-0 px-6 pt-6 pb-3 border-b">
        <DialogTitle>Exportar diagrama</DialogTitle>
        <DialogDescription>
          Configura las opciones de exportacion. La vista previa se actualiza en vivo.
        </DialogDescription>
      </DialogHeader>

      <div className="flex min-h-0 flex-1 gap-6 p-6 overflow-hidden">
        {/* Left: Preview */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            ref={canvasRef}
            className="relative flex min-h-0 flex-1 overflow-hidden rounded-lg border bg-muted/30"
          >
            <div
              key={previewKey}
              className="absolute"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) scale(${scale})`,
                transformOrigin: "center center",
                width: `${sizePx}px`,
              }}
            >
              {previewContainer}
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-72 shrink-0 space-y-5 overflow-y-auto">
          {/* Layout */}
          <fieldset>
            <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Palette className="size-3" />
              Diseno
            </Label>
            <RadioGroup
              value={options.layout}
              onValueChange={(v) => {
                setExportOptions({ layout: v });
                debouncedPreview();
              }}
              className="space-y-1"
            >
              {descriptor.layouts.map((layout) => (
                <label
                  key={layout.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                    options.layout === layout.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <RadioGroupItem value={layout.id} className="sr-only" />
                  <span className="size-3.5 rounded-full border-2 flex items-center justify-center">
                    {options.layout === layout.id && <Check className="size-2.5" />}
                  </span>
                  {layout.labelEs}
                </label>
              ))}
            </RadioGroup>
          </fieldset>

          {/* Format */}
          <fieldset>
            <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Download className="size-3" />
              Formato
            </Label>
            <div className="flex gap-1">
              {(["svg", "png", "pdf"] as const).map((fmt) => (
                <Button
                  key={fmt}
                  variant={options.format === fmt ? "secondary" : "outline"}
                  size="sm"
                  className="flex-1 text-xs uppercase"
                  onClick={() => {
                    setExportOptions({ format: fmt });
                    debouncedPreview();
                  }}
                >
                  {fmt}
                </Button>
              ))}
            </div>
          </fieldset>

          {/* Size */}
          <fieldset>
            <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Ruler className="size-3" />
              Tamano
            </Label>
            <div className="space-y-2">
              <Select
                value={sizeSelectValue}
                onValueChange={(v) => {
                  const preset = SIZE_PRESETS.find((p) => String(p.value) === v);
                  if (preset) {
                    setExportOptions({ size: { value: preset.value, unit: preset.unit } });
                    debouncedPreview();
                  }
                }}
              >
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue placeholder="Preestablecido..." />
                </SelectTrigger>
                <SelectContent>
                  {SIZE_PRESETS.map((preset) => (
                    <SelectItem key={preset.labelEs} value={String(preset.value)} className="text-xs">
                      {preset.labelEs} ({preset.value} {preset.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5">
                <Input
                  type="number"
                  min={options.size.unit === "cm" ? 5 : 200}
                  max={options.size.unit === "cm" ? 211 : 8000}
                  step={options.size.unit === "cm" ? 1 : 50}
                  value={options.size.value}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    if (isNaN(raw)) return;
                    const val = options.size.unit === "cm"
                      ? Math.max(5, Math.min(211, raw))
                      : Math.max(200, Math.min(8000, raw));
                    setExportOptions({ size: { ...options.size, value: val } });
                    debouncedPreview();
                  }}
                  className="h-8 flex-1 text-xs"
                />
                <Select
                  value={options.size.unit}
                  onValueChange={(v) => {
                    const unit = v as ExportSizeUnit;
                    const value =
                      unit === "cm" ? Math.round(options.size.value / 37.795) : cmToPx(options.size.value);
                    setExportOptions({ size: { value, unit } });
                    debouncedPreview();
                  }}
                >
                  <SelectTrigger size="sm" className="h-8 w-16 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_UNITS.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-xs">
                        {u.labelEs}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </fieldset>

          {/* Colors */}
          <fieldset>
            <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Palette className="size-3" />
              Colores
            </Label>
            <div className="space-y-2">
              <Select
                value={EXPORT_COLOR_PRESETS.find((p) => p.colors.header === options.colors.header)?.id ?? "__custom"}
                onValueChange={(v) => {
                  const preset = EXPORT_COLOR_PRESETS.find((p) => p.id === v);
                  if (preset) applyColorPreset(preset.colors);
                  debouncedPreview();
                }}
              >
                <SelectTrigger size="sm" className="w-full text-xs">
                  <SelectValue placeholder="Tema..." />
                </SelectTrigger>
                <SelectContent>
                  {EXPORT_COLOR_PRESETS.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.labelEs}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-5 gap-1.5">
                {(
                  ["header", "card", "accent", "background", "text"] as const
                ).map((key) => (
                  <div key={key} className="flex flex-col items-center gap-0.5">
                    <Label className="text-[9px] text-muted-foreground capitalize">
                      {key}
                    </Label>
                    <input
                      type="color"
                      value={options.colors[key]}
                      onChange={(e) => {
                        setExportColor(key, e.target.value);
                        debouncedPreview();
                      }}
                      className="size-6 cursor-pointer rounded border p-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          </fieldset>

          {/* Watermark */}
          <fieldset>
            <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ToggleLeft className="size-3" />
              Marca de agua
            </Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={options.watermark.enabled}
                  onCheckedChange={(checked) => {
                    setExportWatermark({ enabled: checked });
                    debouncedPreview();
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  {options.watermark.enabled ? "Activada" : "Desactivada"}
                </span>
              </div>
              {options.watermark.enabled && (
                <Input
                  value={options.watermark.text}
                  onChange={(e) => {
                    setExportWatermark({ text: e.target.value });
                    debouncedPreview();
                  }}
                  placeholder="Texto de marca de agua..."
                  className="h-8 text-xs"
                />
              )}
            </div>
          </fieldset>

          {/* Fields */}
          <fieldset>
            <Label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Type className="size-3" />
              Campos
            </Label>
            <div className="space-y-1.5">
              {descriptor.fields.map((field) => (
                <label
                  key={field.id}
                  className="flex cursor-pointer items-center gap-2 text-xs"
                >
                  <Checkbox
                    checked={options.fields.includes(field.id)}
                    onCheckedChange={() => {
                      toggleField(field.id);
                      debouncedPreview();
                    }}
                  />
                  {field.labelEs}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-end gap-2 border-t px-6 py-4">
        <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={onExport}
          disabled={exporting}
          className="text-xs"
        >
          <Download className="mr-1.5 size-3.5" />
          {exporting ? "Exportando..." : `Exportar ${options.format.toUpperCase()}`}
        </Button>
      </div>
    </div>
  );
}
