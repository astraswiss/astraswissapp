"use client";

import { useRouter } from "next/navigation";
import { DocumentForm } from "@/components/documents/document-form";

export default function NeueRechnungPage() {
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Neue Rechnung</h1>
      <DocumentForm kind="invoice" onSaved={(invoice) => router.replace(`/rechnungen/${invoice.id}`)} />
    </div>
  );
}
