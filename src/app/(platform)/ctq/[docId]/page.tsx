"use client";

import { useParams } from "next/navigation";

import { CtqEditor } from "@/tools/ctq/components/ctq-editor";

export default function CtqPage() {
  const params = useParams();
  const docId = params.docId as string;

  return <CtqEditor docId={docId} />;
}
