"use client";

import { useParams } from "next/navigation";

import { IshikawaEditor } from "@/tools/ishikawa/components/ishikawa-editor";

export default function IshikawaDocPage() {
  const params = useParams();
  const docId = params.docId as string;

  return <IshikawaEditor docId={docId} />;
}
