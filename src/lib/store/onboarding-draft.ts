import type { CompanyFormValues } from "@/components/onboarding/company-form";

const KEY = "astra.onboarding.draft";

/** Holds step-1 onboarding data in sessionStorage while the user is still on step 2 (branding) — cleared once the company profile is actually saved. */
export function saveDraft(draft: CompanyFormValues): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function getDraft(): CompanyFormValues | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
