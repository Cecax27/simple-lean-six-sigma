"use client";

import { useParams } from "next/navigation";

import { CartaControlEditor } from "@/tools/carta-control/components/carta-control-editor";

export default function CartaControlPage() {
  const params = useParams();
  const docId = params.docId as string;

  return <CartaControlEditor docId={docId} />;
}
