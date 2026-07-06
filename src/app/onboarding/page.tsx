"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CompanyForm, type CompanyFormValues } from "@/components/onboarding/company-form";
import { hasCompany } from "@/lib/store/company";
import { saveDraft } from "@/lib/store/onboarding-draft";

export default function OnboardingPage() {
  const router = useRouter();

  useEffect(() => {
    if (hasCompany()) {
      router.replace("/rechnungen");
    }
  }, [router]);

  function handleSubmit(values: CompanyFormValues) {
    saveDraft(values);
    router.push("/onboarding/branding");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Schritt 1 von 2</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
        Willkommen bei Astra
      </h1>
      <p className="mt-2 text-ink-soft">
        Erzählen Sie uns etwas über Ihre Firma — diese Angaben erscheinen auf
        Ihren Rechnungen und Offerten und lassen sich jederzeit unter
        Einstellungen anpassen.
      </p>
      <div className="mt-8">
        <CompanyForm submitLabel="Weiter" onSubmit={handleSubmit} />
      </div>
    </main>
  );
}
