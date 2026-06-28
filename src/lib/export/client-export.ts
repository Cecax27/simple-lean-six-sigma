"use client";

import { jsPDF } from "jspdf";
import { toPng, toSvg } from "html-to-image";
import type { SIPOCDiagram } from "@/tools/sipoc/types";
import type { CTQTree } from "@/tools/ctq/types";
import type { ExportOptions } from "@/lib/export/types";
import { renderSipocToSvg } from "@/lib/export/native-svg";
import { renderCtqToSvg } from "@/lib/export/ctq-native-svg";

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function safeName(name: string, fallback = "diagrama"): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized.replace(/[^a-z0-9-_]/g, "") || fallback;
}

export interface ExportImageOptions {
  pixelRatio?: number;
  backgroundColor?: string;
  filename?: string;
}

async function renderElement(
  element: HTMLElement,
  opts: { pixelRatio?: number; backgroundColor?: string },
  renderFn: (el: HTMLElement, opts: { cacheBust: boolean; backgroundColor: string; pixelRatio: number }) => Promise<string>,
): Promise<string> {
  const backgroundColor = opts.backgroundColor ?? "#ffffff";
  const pixelRatio = opts.pixelRatio ?? 2;

  return renderFn(element, {
    cacheBust: true,
    backgroundColor,
    pixelRatio,
  });
}

export async function exportAsSvg(
  element: HTMLElement,
  diagramTitle: string,
  options: ExportImageOptions = {},
): Promise<void> {
  const dataUrl = await renderElement(element, options, toSvg);

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const filename = options.filename ?? `${safeName(diagramTitle)}.svg`;
  downloadBlob(filename, blob);
}

export async function exportAsNativeSvg(
  diagram: SIPOCDiagram,
  pathLabels: string[],
  exportOptions: ExportOptions,
  diagramTitle: string,
  options: ExportImageOptions = {},
): Promise<void> {
  const svg = renderSipocToSvg(diagram, pathLabels, exportOptions);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const filename = options.filename ?? `${safeName(diagramTitle)}.svg`;
  downloadBlob(filename, blob);
}

export async function exportCtqAsSvg(
  tree: CTQTree,
  exportOptions: ExportOptions,
  title: string,
  options: ExportImageOptions = {},
): Promise<void> {
  const svg = renderCtqToSvg(tree, exportOptions);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const filename = options.filename ?? `${safeName(title)}.svg`;
  downloadBlob(filename, blob);
}

export async function exportAsPng(
  element: HTMLElement,
  diagramTitle: string,
  options: ExportImageOptions = {},
): Promise<void> {
  const dataUrl = await renderElement(element, options, toPng);

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const filename = options.filename ?? `${safeName(diagramTitle)}.png`;
  downloadBlob(filename, blob);
}

export async function exportAsPdf(
  element: HTMLElement,
  diagramTitle: string,
  options: ExportImageOptions = {},
): Promise<void> {
  const pixelRatio = options.pixelRatio ?? 2;
  const backgroundColor = options.backgroundColor ?? "#ffffff";

  const pngDataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor,
    pixelRatio,
  });

  const img = new Image();
  img.src = pngDataUrl;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("No se pudo preparar la imagen para PDF."));
  });

  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageRatio = img.width / img.height;
  const pageRatio = pageWidth / pageHeight;

  let renderWidth = pageWidth - 32;
  let renderHeight = renderWidth / imageRatio;

  if (imageRatio < pageRatio) {
    renderHeight = pageHeight - 32;
    renderWidth = renderHeight * imageRatio;
  }

  const x = (pageWidth - renderWidth) / 2;
  const y = (pageHeight - renderHeight) / 2;

  pdf.addImage(pngDataUrl, "PNG", x, y, renderWidth, renderHeight);
  const filename = options.filename ?? `${safeName(diagramTitle)}.pdf`;
  pdf.save(filename);
}
