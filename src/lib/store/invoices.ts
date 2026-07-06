import { listCollection, nextDocumentNumber, saveCollection } from "./storage";
import type { Invoice } from "./types";

const KEY = "invoices" as const;

export type InvoiceInput = Omit<Invoice, "id" | "kind" | "number" | "createdAt" | "updatedAt">;

export function listInvoices(): Invoice[] {
  return listCollection<Invoice>(KEY).sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}

export function getInvoice(id: string): Invoice | null {
  return listInvoices().find((invoice) => invoice.id === id) ?? null;
}

export function createInvoice(input: InvoiceInput): Invoice {
  const now = new Date().toISOString();
  const existing = listCollection<Invoice>(KEY);
  const invoice: Invoice = {
    ...input,
    id: crypto.randomUUID(),
    kind: "invoice",
    number: nextDocumentNumber("RE", existing),
    createdAt: now,
    updatedAt: now,
  };
  saveCollection(KEY, [...existing, invoice]);
  return invoice;
}

export function updateInvoice(id: string, patch: Partial<InvoiceInput>): Invoice {
  const now = new Date().toISOString();
  let updated: Invoice | null = null;
  const items = listCollection<Invoice>(KEY).map((invoice) => {
    if (invoice.id !== id) return invoice;
    updated = { ...invoice, ...patch, updatedAt: now };
    return updated;
  });
  if (!updated) throw new Error(`Rechnung ${id} nicht gefunden.`);
  saveCollection(KEY, items);
  return updated;
}

export function deleteInvoice(id: string): void {
  saveCollection(
    KEY,
    listCollection<Invoice>(KEY).filter((invoice) => invoice.id !== id),
  );
}
