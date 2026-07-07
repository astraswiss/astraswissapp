"use client";

import { useState } from "react";
import { ButtonEl } from "@/components/ui/button";
import type { Client, Company, Invoice, Offer } from "@/lib/store/types";

export function PdfDownloadButton({
  kind,
  doc,
  company,
  client,
}: {
  kind: "invoice" | "offer";
  doc: Invoice | Offer;
  company: Company;
  client: Client;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setLoading(true);
    setError(null);
    try {
      const endpoint = kind === "invoice" ? "invoices" : "offers";
      const res = await fetch(`/api/${endpoint}/${doc.id}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document: doc, company, client }),
      });
      if (!res.ok) throw new Error("PDF-Erstellung fehlgeschlagen.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      // Opened in a new tab rather than triggered via a hidden <a download>:
      // some embedded/webview browsers don't honor the `download` attribute
      // for blob URLs and instead navigate the *current* tab to the PDF,
      // which — inside this app's single-page shell — replaced the whole
      // dashboard (chat dock included) with the PDF viewer. window.open
      // keeps that fallback contained to a new tab no matter the browser.
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <ButtonEl type="button" variant="secondary" onClick={handleDownload} disabled={loading}>
        {loading ? "Erstelle PDF…" : "PDF öffnen"}
      </ButtonEl>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
