"use client";

import { useParams } from "next/navigation";

import { ProcessMapEditor } from "@/tools/mapa-proceso-extendido/components/process-map-editor";

export default function ProcessMapPage() {
  const params = useParams();
  const docId = params.docId as string;

  return <ProcessMapEditor docId={docId} />;
}
