"use client";

import { jsPDF } from "jspdf";
import { toPng, toSvg } from "html-to-image";

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

function safeName(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "-");
  return normalized.replace(/[^a-z0-9-_]/g, "") || "diagrama-sipoc";
}

export async function exportAsSvg(element: HTMLElement, diagramTitle: string): Promise<void> {
  const dataUrl = await toSvg(element, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  downloadBlob(`${safeName(diagramTitle)}.svg`, blob);
}

export async function exportAsPng(element: HTMLElement, diagramTitle: string): Promise<void> {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  downloadBlob(`${safeName(diagramTitle)}.png`, blob);
}

export async function exportAsPdf(element: HTMLElement, diagramTitle: string): Promise<void> {
  const pngDataUrl = await toPng(element, {
    cacheBust: true,
    backgroundColor: "#ffffff",
    pixelRatio: 2,
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
  pdf.save(`${safeName(diagramTitle)}.pdf`);
}
