"use client";

import { useRouter } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";

export default function NeueOffertePage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Neue Offerte</h1>
      <DocumentForm kind="offer" onSaved={(offer) => router.replace(`/offerten/${offer.id}`)} />
    </div>
  );
}
