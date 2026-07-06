import { z } from "zod";

export const addressSchema = z.object({
  street: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
});

export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  address: addressSchema,
  uid: z.string().optional(),
  iban: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  brandingColor: z.string(),
  defaultTemplateId: z.enum(["minimal", "classic", "bold"]).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: addressSchema,
  email: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  vatRate: z.number(),
});

const documentBaseSchema = {
  id: z.string(),
  number: z.string(),
  clientId: z.string(),
  templateId: z.enum(["minimal", "classic", "bold"]),
  lineItems: z.array(lineItemSchema),
  currency: z.literal("CHF"),
  issueDate: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
};

export const invoiceSchema = z.object({
  ...documentBaseSchema,
  kind: z.literal("invoice"),
  status: z.enum(["entwurf", "versendet", "bezahlt"]),
  dueDate: z.string(),
  referenceType: z.enum(["QRR", "SCOR", "NON"]),
  reference: z.string().optional(),
});

export const offerSchema = z.object({
  ...documentBaseSchema,
  kind: z.literal("offer"),
  status: z.enum(["entwurf", "versendet", "angenommen", "abgelehnt"]),
  validUntil: z.string().optional(),
});

export const pdfRequestSchema = z.object({
  document: z.union([invoiceSchema, offerSchema]),
  company: companySchema,
  client: clientSchema,
});
