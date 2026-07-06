import { getCompany } from "@/lib/store/company";
import { listClients, createClient, updateClient, deleteClient } from "@/lib/store/clients";
import { listInvoices, createInvoice, updateInvoice, deleteInvoice } from "@/lib/store/invoices";
import { listOffers, createOffer, updateOffer, deleteOffer } from "@/lib/store/offers";
import type { InvoiceStatus, LineItem, OfferStatus } from "@/lib/store/types";
import { todayIso } from "@/lib/format";

type ToolInput = Record<string, unknown>;

function str(input: ToolInput, key: string): string {
  return typeof input[key] === "string" ? (input[key] as string) : "";
}

function optStr(input: ToolInput, key: string): string | undefined {
  return typeof input[key] === "string" ? (input[key] as string) : undefined;
}

function toLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) return [];
  return (raw as ToolInput[]).map((item) => ({
    id: crypto.randomUUID(),
    description: String(item.description ?? ""),
    quantity: Number(item.quantity ?? 0),
    unitPrice: Number(item.unitPrice ?? 0),
    vatRate: Number(item.vatRate ?? 8.1),
  }));
}

function addressFromInput(input: ToolInput) {
  return {
    street: str(input, "street"),
    houseNumber: str(input, "houseNumber"),
    postalCode: str(input, "postalCode"),
    city: str(input, "city"),
    country: optStr(input, "country") ?? "CH",
  };
}

/** Executes a tool call from Claude against the browser's localStorage-backed store. Runs client-side because that's where the data lives — see use-chat-agent.ts for the surrounding loop. */
export function executeTool(name: string, input: ToolInput): unknown {
  switch (name) {
    case "get_company":
      return getCompany();

    case "list_clients":
      return listClients();
    case "create_client":
      return createClient({
        name: str(input, "name"),
        address: addressFromInput(input),
        email: optStr(input, "email"),
        phone: optStr(input, "phone"),
      });
    case "update_client": {
      const patch: Record<string, unknown> = {};
      if (typeof input.name === "string") patch.name = input.name;
      if (typeof input.email === "string") patch.email = input.email;
      if (typeof input.phone === "string") patch.phone = input.phone;
      if (["street", "houseNumber", "postalCode", "city", "country"].some((k) => typeof input[k] === "string")) {
        patch.address = addressFromInput(input);
      }
      return updateClient(str(input, "id"), patch);
    }
    case "delete_client":
      deleteClient(str(input, "id"));
      return { ok: true };

    case "list_invoices": {
      const status = optStr(input, "status") as InvoiceStatus | undefined;
      const all = listInvoices();
      return status ? all.filter((invoice) => invoice.status === status) : all;
    }
    case "create_invoice":
      return createInvoice({
        clientId: str(input, "clientId"),
        templateId: getCompany()?.defaultTemplateId ?? "minimal",
        lineItems: toLineItems(input.lineItems),
        currency: "CHF",
        issueDate: optStr(input, "issueDate") ?? todayIso(),
        note: optStr(input, "note"),
        status: "entwurf",
        dueDate: optStr(input, "dueDate") ?? todayIso(),
        referenceType: "NON",
      });
    case "update_invoice": {
      const patch: Record<string, unknown> = {};
      if (typeof input.status === "string") patch.status = input.status;
      if (typeof input.note === "string") patch.note = input.note;
      if (typeof input.dueDate === "string") patch.dueDate = input.dueDate;
      if (Array.isArray(input.lineItems)) patch.lineItems = toLineItems(input.lineItems);
      return updateInvoice(str(input, "id"), patch);
    }
    case "delete_invoice":
      deleteInvoice(str(input, "id"));
      return { ok: true };

    case "list_offers": {
      const status = optStr(input, "status") as OfferStatus | undefined;
      const all = listOffers();
      return status ? all.filter((offer) => offer.status === status) : all;
    }
    case "create_offer":
      return createOffer({
        clientId: str(input, "clientId"),
        templateId: getCompany()?.defaultTemplateId ?? "minimal",
        lineItems: toLineItems(input.lineItems),
        currency: "CHF",
        issueDate: optStr(input, "issueDate") ?? todayIso(),
        note: optStr(input, "note"),
        status: "entwurf",
        validUntil: optStr(input, "validUntil"),
      });
    case "update_offer": {
      const patch: Record<string, unknown> = {};
      if (typeof input.status === "string") patch.status = input.status;
      if (typeof input.note === "string") patch.note = input.note;
      if (typeof input.validUntil === "string") patch.validUntil = input.validUntil;
      if (Array.isArray(input.lineItems)) patch.lineItems = toLineItems(input.lineItems);
      return updateOffer(str(input, "id"), patch);
    }
    case "delete_offer":
      deleteOffer(str(input, "id"));
      return { ok: true };

    default:
      throw new Error(`Unbekanntes Tool: ${name}`);
  }
}
