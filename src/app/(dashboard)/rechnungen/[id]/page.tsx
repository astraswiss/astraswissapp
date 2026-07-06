"use client";

import { use } from "react";
import { DocumentForm } from "@/components/documents/document-form";
import { useInvoices } from "@/lib/store/hooks";

export default function RechnungDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const invoices = useInvoices();
  const invoice = invoices.find((i) => i.id === id);

  if (!invoice) {
    return <p className="text-sm text-ink-faint">Rechnung nicht gefunden.</p>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Rechnung {invoice.number}</h1>
      <DocumentForm kind="invoice" existing={invoice} onSaved={() => {}} />
    </div>
  );
}
