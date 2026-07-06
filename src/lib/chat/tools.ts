import type Anthropic from "@anthropic-ai/sdk";

const lineItemInputSchema = {
  type: "array" as const,
  items: {
    type: "object" as const,
    properties: {
      description: { type: "string" },
      quantity: { type: "number" },
      unitPrice: { type: "number" },
      vatRate: { type: "number", description: "MWST-Satz in Prozent, z.B. 8.1. Standard: 8.1." },
    },
    required: ["description", "quantity", "unitPrice"],
  },
};

/** Tool definitions in Anthropic's tool-use JSON-schema format. Kept 1:1 with the store functions in execute-tool.ts — no generic "run arbitrary function" tool. */
export const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_company",
    description: "Firmenprofil des aktuellen Nutzers abrufen (Name, Adresse, IBAN, Markenfarbe, Standardvorlage).",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_clients",
    description: "Alle erfassten Kunden auflisten (id, Name, Adresse).",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "create_client",
    description: "Neuen Kunden anlegen.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        street: { type: "string" },
        houseNumber: { type: "string" },
        postalCode: { type: "string" },
        city: { type: "string" },
        country: { type: "string", description: "ISO-Ländercode, z.B. CH. Standard: CH." },
        email: { type: "string" },
        phone: { type: "string" },
      },
      required: ["name"],
    },
  },
  {
    name: "update_client",
    description: "Bestehenden Kunden bearbeiten.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        street: { type: "string" },
        houseNumber: { type: "string" },
        postalCode: { type: "string" },
        city: { type: "string" },
        country: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_client",
    description: "Kunden löschen.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "list_invoices",
    description: "Rechnungen auflisten, optional gefiltert nach Status.",
    input_schema: {
      type: "object",
      properties: { status: { type: "string", enum: ["entwurf", "versendet", "bezahlt"] } },
      required: [],
    },
  },
  {
    name: "create_invoice",
    description:
      "Neue Rechnung für einen Kunden anlegen. clientId muss über list_clients aufgelöst werden (bei unbekanntem Namen zuerst create_client aufrufen).",
    input_schema: {
      type: "object",
      properties: {
        clientId: { type: "string" },
        lineItems: lineItemInputSchema,
        dueDate: { type: "string", description: "ISO-Datum, z.B. 2026-08-01" },
        issueDate: { type: "string", description: "ISO-Datum. Standard: heute." },
        note: { type: "string" },
      },
      required: ["clientId", "lineItems"],
    },
  },
  {
    name: "update_invoice",
    description: "Bestehende Rechnung bearbeiten (Status, Positionen, Fälligkeit, Notiz).",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: ["entwurf", "versendet", "bezahlt"] },
        lineItems: lineItemInputSchema,
        dueDate: { type: "string" },
        note: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_invoice",
    description: "Rechnung löschen.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
  {
    name: "list_offers",
    description: "Offerten auflisten, optional gefiltert nach Status.",
    input_schema: {
      type: "object",
      properties: { status: { type: "string", enum: ["entwurf", "versendet", "angenommen", "abgelehnt"] } },
      required: [],
    },
  },
  {
    name: "create_offer",
    description:
      "Neue Offerte für einen Kunden anlegen. clientId muss über list_clients aufgelöst werden (bei unbekanntem Namen zuerst create_client aufrufen).",
    input_schema: {
      type: "object",
      properties: {
        clientId: { type: "string" },
        lineItems: lineItemInputSchema,
        validUntil: { type: "string", description: "ISO-Datum" },
        issueDate: { type: "string", description: "ISO-Datum. Standard: heute." },
        note: { type: "string" },
      },
      required: ["clientId", "lineItems"],
    },
  },
  {
    name: "update_offer",
    description: "Bestehende Offerte bearbeiten (Status, Positionen, Gültigkeit, Notiz).",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
        status: { type: "string", enum: ["entwurf", "versendet", "angenommen", "abgelehnt"] },
        lineItems: lineItemInputSchema,
        validUntil: { type: "string" },
        note: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_offer",
    description: "Offerte löschen.",
    input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
  },
];

export const CHAT_MODEL = "claude-haiku-4-5-20251001";
