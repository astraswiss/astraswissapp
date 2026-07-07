"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonEl } from "@/components/ui/button";
import { saveCompany } from "@/lib/store/company";
import { createClient } from "@/lib/store/clients";
import { createInvoice } from "@/lib/store/invoices";
import { createOffer } from "@/lib/store/offers";
import type { LineItem, TemplateId } from "@/lib/store/types";

function items(...rows: [string, number, number, number][]): LineItem[] {
  return rows.map(([description, quantity, unitPrice, vatRate], i) => ({
    id: `li-${i}`,
    description,
    quantity,
    unitPrice,
    vatRate,
  }));
}

function seed() {
  saveCompany({
    name: "Kohler Elektro AG",
    address: { street: "Industriestrasse", houseNumber: "14", postalCode: "8005", city: "Zürich", country: "CH" },
    uid: "CHE-105.234.567",
    iban: "CH93 0076 2011 6238 5295 7",
    email: "info@kohler-elektro.ch",
    phone: "044 555 12 34",
    brandingColor: "#3454d1",
    defaultTemplateId: "minimal",
  });

  const mueller = createClient({
    name: "Müller Sanitär GmbH",
    address: { street: "Seefeldstrasse", houseNumber: "5", postalCode: "8008", city: "Zürich", country: "CH" },
    email: "kontakt@mueller-sanitaer.ch",
    phone: "044 222 33 44",
  });
  const sonnenschein = createClient({
    name: "Café Sonnenschein",
    address: { street: "Marktgasse", houseNumber: "9", postalCode: "3011", city: "Bern", country: "CH" },
    email: "hallo@cafe-sonnenschein.ch",
  });
  const nordstrasse = createClient({
    name: "Immobilien Nordstrasse AG",
    address: { street: "Nordstrasse", houseNumber: "22", postalCode: "4051", city: "Basel", country: "CH" },
    email: "verwaltung@nordstrasse-immo.ch",
    phone: "061 777 88 99",
  });
  createClient({
    name: "Bäckerei Frei",
    address: { street: "Dorfstrasse", houseNumber: "3", postalCode: "6003", city: "Luzern", country: "CH" },
  });

  const templates: TemplateId[] = ["minimal", "classic", "bold"];

  const invoiceData: {
    clientId: string;
    templateId: TemplateId;
    status: "entwurf" | "versendet" | "bezahlt";
    issueDate: string;
    dueDate: string;
    lineItems: LineItem[];
  }[] = [
    {
      clientId: mueller.id,
      templateId: templates[0],
      status: "bezahlt",
      issueDate: "2026-06-02",
      dueDate: "2026-06-16",
      lineItems: items(
        ["Elektroinstallation Badezimmer", 1, 1450, 8.1],
        ["Materialpauschale", 1, 320, 8.1],
      ),
    },
    {
      clientId: sonnenschein.id,
      templateId: templates[1],
      status: "versendet",
      issueDate: "2026-06-20",
      dueDate: "2026-07-04",
      lineItems: items(
        ["Beleuchtung Gastraum, Montage", 8, 95, 8.1],
        ["LED-Panels", 12, 45, 8.1],
      ),
    },
    {
      clientId: nordstrasse.id,
      templateId: templates[2],
      status: "entwurf",
      issueDate: "2026-07-01",
      dueDate: "2026-07-15",
      lineItems: items(
        ["Sicherheitsprüfung Elektroanlage", 1, 890, 8.1],
        ["Revisionsbericht", 1, 180, 8.1],
      ),
    },
    {
      clientId: mueller.id,
      templateId: templates[0],
      status: "versendet",
      issueDate: "2026-06-28",
      dueDate: "2026-07-12",
      lineItems: items(["Störungsbehebung Sicherung", 2, 110, 8.1]),
    },
  ];

  for (const inv of invoiceData) {
    createInvoice({
      clientId: inv.clientId,
      templateId: inv.templateId,
      lineItems: inv.lineItems,
      currency: "CHF",
      issueDate: inv.issueDate,
      status: inv.status,
      dueDate: inv.dueDate,
      referenceType: "NON",
    });
  }

  const offerData: {
    clientId: string;
    templateId: TemplateId;
    status: "entwurf" | "versendet" | "angenommen" | "abgelehnt";
    issueDate: string;
    validUntil?: string;
    lineItems: LineItem[];
  }[] = [
    {
      clientId: nordstrasse.id,
      templateId: templates[2],
      status: "angenommen",
      issueDate: "2026-05-14",
      validUntil: "2026-06-14",
      lineItems: items(
        ["Komplettsanierung Elektroinstallation", 1, 12500, 8.1],
        ["Notbeleuchtung Treppenhaus", 1, 1800, 8.1],
      ),
    },
    {
      clientId: sonnenschein.id,
      templateId: templates[1],
      status: "versendet",
      issueDate: "2026-06-25",
      validUntil: "2026-07-25",
      lineItems: items(["Aussenbeleuchtung Terrasse", 6, 210, 8.1]),
    },
    {
      clientId: mueller.id,
      templateId: templates[0],
      status: "abgelehnt",
      issueDate: "2026-05-02",
      validUntil: "2026-06-02",
      lineItems: items(["Wärmepumpen-Verkabelung", 1, 2400, 8.1]),
    },
  ];

  for (const off of offerData) {
    createOffer({
      clientId: off.clientId,
      templateId: off.templateId,
      lineItems: off.lineItems,
      currency: "CHF",
      issueDate: off.issueDate,
      status: off.status,
      validUntil: off.validUntil,
    });
  }
}

export default function SeedPage() {
  const router = useRouter();
  const [done, setDone] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-ink">Testdaten laden</h1>
      <p className="max-w-sm text-sm text-ink-soft">
        Legt eine Beispielfirma, 4 Kunden sowie ein paar Rechnungen und Offerten in
        verschiedenen Status/Vorlagen im lokalen Speicher an.
      </p>
      {!done ? (
        <ButtonEl
          type="button"
          onClick={() => {
            seed();
            setDone(true);
          }}
        >
          Testdaten anlegen
        </ButtonEl>
      ) : (
        <>
          <p className="text-sm text-accent">Fertig — Testdaten wurden angelegt.</p>
          <ButtonEl type="button" onClick={() => router.replace("/rechnungen")}>
            Zum Dashboard
          </ButtonEl>
        </>
      )}
    </div>
  );
}
