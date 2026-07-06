"use client";

import { useState } from "react";
import { CompanyForm, type CompanyFormValues } from "@/components/onboarding/company-form";
import { ColorPicker } from "@/components/ui/color-picker";
import { useCompany } from "@/lib/store/hooks";
import { updateCompany } from "@/lib/store/company";

export default function EinstellungenPage() {
  const company = useCompany();
  const [saved, setSaved] = useState(false);

  if (!company) return null;

  function handleCompanySubmit(values: CompanyFormValues) {
    updateCompany({
      name: values.name,
      address: values.address,
      uid: values.uid || undefined,
      iban: values.iban,
      email: values.email,
      phone: values.phone || undefined,
    });
    setSaved(true);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-12">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Einstellungen</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Firmendaten und Markenfarbe für Ihre Rechnungen und Offerten.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Firmendaten</h2>
        <CompanyForm
          submitLabel="Speichern"
          initialValues={{
            name: company.name,
            address: company.address,
            uid: company.uid ?? "",
            iban: company.iban,
            email: company.email,
            phone: company.phone ?? "",
          }}
          onSubmit={handleCompanySubmit}
        />
        {saved && <p className="text-sm text-accent">Gespeichert.</p>}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Markenfarbe</h2>
        <p className="text-sm text-ink-soft">
          Erscheint nur auf Ihren Dokumenten, nicht in der Astra-Oberfläche.
        </p>
        <ColorPicker
          value={company.brandingColor}
          onChange={(color) => updateCompany({ brandingColor: color })}
        />
      </section>

      <section className="rounded-xl border border-line bg-paper-raised px-5 py-4">
        <p className="text-sm text-ink-soft">
          Ihre Daten werden aktuell nur lokal in diesem Browser gespeichert (keine
          Datenbank). Beim Löschen der Browserdaten gehen Firmenprofil, Kunden,
          Rechnungen und Offerten verloren.
        </p>
      </section>
    </div>
  );
}
