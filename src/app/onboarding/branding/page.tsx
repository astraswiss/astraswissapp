"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandingPicker } from "@/components/onboarding/branding-picker";
import { saveCompany } from "@/lib/store/company";
import { getDraft, clearDraft } from "@/lib/store/onboarding-draft";
import type { CompanyFormValues } from "@/components/onboarding/company-form";

export default function OnboardingBrandingPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<CompanyFormValues | null>(null);

  useEffect(() => {
    const stored = getDraft();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    // sessionStorage is only available post-mount; setting state here (rather
    // than a lazy useState initializer) avoids a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(stored);
  }, [router]);

  function handleConfirm(color: string) {
    if (!draft) return;
    saveCompany({
      name: draft.name,
      address: draft.address,
      uid: draft.uid || undefined,
      iban: draft.iban,
      email: draft.email,
      phone: draft.phone || undefined,
      brandingColor: color,
    });
    clearDraft();
    router.replace("/onboarding/tour");
  }

  if (!draft) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Schritt 2 von 3</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        Wählen Sie Ihre Markenfarbe
      </h1>
      <p className="mt-2 text-ink-soft">
        Dieser Farbton macht Ihre Dokumente wiedererkennbar.
      </p>
      <div className="mt-8">
        <BrandingPicker companyName={draft.name} onConfirm={handleConfirm} />
      </div>
    </main>
  );
}
