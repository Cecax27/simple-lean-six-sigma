"use client";

import { useParams } from "next/navigation";

import { SipocEditor } from "@/tools/sipoc/components/sipoc-editor";

export default function SipocPage() {
  const params = useParams();
  const docId = params.docId as string;

  return <SipocEditor docId={docId} />;
}
