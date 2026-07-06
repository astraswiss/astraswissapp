export type TemplateId = "minimal" | "classic" | "bold";

export type Address = {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
};

export type Company = {
  id: string;
  name: string;
  address: Address;
  uid?: string;
  iban: string;
  email: string;
  phone?: string;
  /** Hex color, e.g. "#3454d1". Only ever used inside generated Rechnung/Offerte PDFs — never in the dashboard UI. */
  brandingColor: string;
  defaultTemplateId?: TemplateId;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  name: string;
  address: Address;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

export type LineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type InvoiceStatus = "entwurf" | "versendet" | "bezahlt";
export type OfferStatus = "entwurf" | "versendet" | "angenommen" | "abgelehnt";

export type ReferenceType = "QRR" | "SCOR" | "NON";

type DocumentBase = {
  id: string;
  number: string;
  clientId: string;
  templateId: TemplateId;
  lineItems: LineItem[];
  currency: "CHF";
  issueDate: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = DocumentBase & {
  kind: "invoice";
  status: InvoiceStatus;
  dueDate: string;
  referenceType: ReferenceType;
  reference?: string;
};

export type Offer = DocumentBase & {
  kind: "offer";
  status: OfferStatus;
  validUntil?: string;
};

export function computeTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function computeVatBreakdown(lineItems: LineItem[]): { rate: number; base: number; amount: number }[] {
  const byRate = new Map<number, number>();
  for (const item of lineItems) {
    const base = item.quantity * item.unitPrice;
    byRate.set(item.vatRate, (byRate.get(item.vatRate) ?? 0) + base);
  }
  return [...byRate.entries()]
    .sort(([a], [b]) => a - b)
    .map(([rate, base]) => ({ rate, base, amount: (base * rate) / 100 }));
}
