import { readSingle, writeSingle } from "./storage";
import type { Company, TemplateId } from "./types";

const KEY = "company" as const;

export type CompanyInput = Omit<Company, "id" | "createdAt" | "updatedAt">;

export function getCompany(): Company | null {
  return readSingle<Company>(KEY);
}

export function hasCompany(): boolean {
  return getCompany() !== null;
}

/** Creates the company profile on first onboarding, or fully replaces it. */
export function saveCompany(input: CompanyInput): Company {
  const existing = getCompany();
  const now = new Date().toISOString();
  const company: Company = {
    ...input,
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  writeSingle(KEY, company);
  return company;
}

/** Merges a partial patch into the existing company profile (used by Settings). */
export function updateCompany(patch: Partial<CompanyInput>): Company {
  const existing = getCompany();
  if (!existing) throw new Error("Kein Firmenprofil vorhanden.");
  return saveCompany({ ...existing, ...patch });
}

export function setDefaultTemplate(templateId: TemplateId): Company {
  return updateCompany({ defaultTemplateId: templateId });
}

export function getDefaultTemplate(): TemplateId | null {
  return getCompany()?.defaultTemplateId ?? null;
}
