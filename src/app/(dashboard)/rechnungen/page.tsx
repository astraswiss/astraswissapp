"use client";

import { Button } from "@/components/ui/button";
import { DocumentList } from "@/components/documents/document-list";
import { useClients, useInvoices } from "@/lib/store/hooks";
import { deleteInvoice } from "@/lib/store/invoices";

export default function RechnungenPage() {
  const invoices = useInvoices();
  const clients = useClients();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Rechnungen</h1>
        <Button href="/rechnungen/neu">+ Neue Rechnung</Button>
      </div>
      <DocumentList kind="invoice" documents={invoices} clients={clients} onDelete={deleteInvoice} />
    </div>
  );
}
