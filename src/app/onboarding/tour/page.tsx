"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WelcomeTour } from "@/components/onboarding/welcome-tour";
import { useCompany } from "@/lib/store/hooks";

export default function OnboardingTourPage() {
  const router = useRouter();
  const company = useCompany();

  useEffect(() => {
    if (!company) router.replace("/onboarding");
  }, [company, router]);

  if (!company) return null;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">Schritt 3 von 3</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">So funktioniert Astra</h1>
      <div className="mt-8">
        <WelcomeTour
          brandingColor={company.brandingColor}
          onFinish={() => router.replace("/rechnungen/neu?firstRun=1")}
        />
      </div>
    </main>
  );
}
